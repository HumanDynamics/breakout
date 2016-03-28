var _ = require('underscore');
var winston = require('winston');
var talk_time = require('./talk_time');
var turns = require('./statistics/turns');

var app = require('./app');
// wait 2 seconds to consider a hangout dead.
var waitingThreshold = 10 * 1000;
var heartbeats = {};
var heartbeatListener = null;


// hangout_id is the hangout to set inactive.
// cb is a callback to be called with whether the hangout was
// successfully changed in the database.
var setHangoutInactive = function(hangout_id, cb) {
    winston.log("info", "trying to set hangout inactive for hangout id:", hangout_id);
    var res = false;
    app.service('hangouts').find(
        {
            query: {
                'hangout_id': hangout_id,
                $limit: 1
            }
        },
        function(error, foundHangouts) {
            if (error) {
                winston.log('error', 'Could not find hangout -- error:', hangout_id, error);
                res = false;
            } else if (foundHangouts.length == 0) {
                winston.log('error', 'Could not find hangout -- no results back:', hangout_id);
                res = false;
            } else {
                var hangout = foundHangouts[0];
                app.service('hangouts').patch(
                    hangout._id,
                    {
                        participants: [],
                        active: false,
                        end_time: new Date()
                    },
                    {},
                    function(error, data) {
                        if (error) {
                            winston.log('error', 'Could not change hangout status', hangout_id);
                            res = false;
                        } else {
                            talk_time.stop(hangout_id);
                            turns.stop(hangout_id);
                            winston.log('info', "Hangout now inactive:", hangout_id);
                            res = true;
                        }
                    }
                );
                res = true;

                // finish callback
                cb(res);
            }
        });

        app.service('hangout_events').create(
            {
                'hangout_id': hangout_id,
                event: 'end',
                timestamp: new Date()
            },
            {},
            function (error, data) {
                if (error) {
                } else {
                    winston.log("info", "Hangout end event created");
                }
            }
        );
    };


    // checks a given list of heartbeats for timeouts. If all hearbeats have
    // timed out, then set the associated hangout to inactive.
    var checkHeartbeats = function(hangout_id) {
        var timedOuts = _.map(heartbeats[hangout_id], checkHeartbeat);
        if (_.every(timedOuts)) {
            setHangoutInactive(hangout_id, function(res) {
                if (res) {
                    delete heartbeats[hangout_id];
                } else {
                    winston.log("info", "Unable to stop heartbeat for hangout", hangout_id);
                }
            });
        } else {
            return;
        }
    };

    // Returns true if the given heartbeat has timed out.
    var checkHeartbeat = function (heartbeat) {
        var delta = (new Date()) - heartbeat.timestamp;
        return (delta > waitingThreshold);
    }

    // checks all hangouts / heartbeats for timeouts.
    // if all heartbeats for a hangout have timed out, set it as inactive
    // and remove it from the checker.
    var checkAllHeartbeats = function() {
        _.each(_.keys(heartbeats), checkHeartbeats);
    };

    // removes all heartbeat records that match the given hangout ID and participant
    // ID in the heartbeat.
    var stopHeartbeat = function(heartbeat) {
        winston.log("info", "Stopping heartbeat for hangout:", heartbeat.hangout_id);
        heartbeat.hangout_id = _.filter(heartbeat.hangout_id, function(obj) {
            return obj.participant_id != heartbeat.participant_id;
        });
    };

    // Either creates a new heartbeat record, or updates an existing one with a
    // revised timestamp.
    // TODO: If we receive a heartbeat from a hangout that is marked as inactive,
    // mark it as active.
    var updateHeartbeat = function(heartbeat) {
        _.each(heartbeats[heartbeat.hangout_id], function(obj) {
            if (obj.participant_id == heartbeat.participant_id) {
                obj.timestamp = new Date();
                return;
            }
        });
        // if we're here, we didn't find a matching heartbeat. make a new one.
        var hbObj = _.extend(heartbeat, {'timestamp': new Date()});
        if (_.has(heartbeats, heartbeat.hangout_id)) {
            heartbeats[heartbeat.hangout_id].push(hbObj);
        } else {
            heartbeats[heartbeat.hangout_id] = [hbObj];
        }
        return;
    };


    function listenHeartbeats(socket) {
        socket.on("heartbeat-start", updateHeartbeat);
        socket.on("heartbeat-stop", stopHeartbeat);
        heartbeatListener = setInterval(
            checkAllHeartbeats, 1000);
        }

        module.exports =
        {
            listen_heartbeats: listenHeartbeats
        };
