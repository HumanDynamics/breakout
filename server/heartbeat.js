var _ = require('underscore');
var winston = require('winston');
var talk_time = require('./talk_time');

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
                            talk_time.stop_talk_times(hangout_id);
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

var checkHeartbeat = function(heartbeat, hangout_id) {
    var lastHeartbeat = heartbeat.timestamp;
    var now = new Date();
    var delta = now - lastHeartbeat;
    if (delta > waitingThreshold) {
        var res = setHangoutInactive(hangout_id, function(res) {
            if (res) {
                stopHeartbeat(heartbeat);
            } else {
                // hangout not even in database??
                winston.log("info", "Hangout not found in database.");
            }
        });
    }
};

var checkAllHeartbeats = function() {
    _.each(heartbeats, checkHeartbeat);
};

var stopHeartbeat = function(heartbeat) {
    winston.log("info", "Stopping heartbeat for hangout:", heartbeat.hangout_id);
    delete heartbeats[heartbeat.hangout_id];
};

var updateHeartbeat = function(heartbeat) {
    winston.log("info", "Updating heartbeat for hangout:", heartbeat.hangout_id);
    heartbeats[heartbeat.hangout_id] =
        {
            hangout_id: heartbeat.hangout_id,
            participant_id: heartbeat.participant_id,
            timestamp: new Date()
        };
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
