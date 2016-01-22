var services = require('./services');
var _ = require('underscore');
var winston = require('winston');
var talk_time = require('./talk_time');
// wait 2 seconds to consider a hangout dead.
var waitingThreshold = 10 * 1000;
var heartbeats = {};
var heartbeatListener = null;


var setHangoutInactive = function(hangout_id) {
    services.hangoutService.find(
        {
            query: {
                'hangout_id': hangout_id,
                $limit: 1
            }
        },
        function(error, foundHangouts) {
            if (error) {
                winston.log('error', 'Could not find hangout:', hangout_id);
                return false;
            } else {
                var hangout = foundHangouts[0];
                services.hangoutService.patch(
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
                            return false;
                        } else {
                            talk_time.stop_talk_times(hangout_id);
                            winston.log('info', "Hangout now inactive:", hangout_id);
                            return true;
                        }
                    }
                );
                return true;
            }
        });

    services.hangoutEventService.create(
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

var checkHeartbeat = function(heartbeat) {
    var lastHeartbeat = heartbeat.timestamp;
    var now = new Date();
    var delta = now - lastHeartbeat;
    if (delta > waitingThreshold) {
        setHangoutInactive(heartbeat.hangout_id);
        stopHeartbeat(heartbeat);
    }
};

var checkAllHeartbeats = function() {
    _.each(heartbeats, checkHeartbeat);
};

var stopHeartbeat = function(heartbeat) {
    winston.log("info", "Stopping heartbeat for hangout:", heartbeat.hangout_id);
    delete heartbeats[heartbeat.hangout_id];
    winston.log("info", "heartbeats:", heartbeats);
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
        checkAllHeartbeats, 5000);
}

module.exports = 
    {
        listen_heartbeats: listenHeartbeats
    };
