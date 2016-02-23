// Listener registeres all the primus listeners for this plugin
// instance.
define(["underscore"], function(underscore) {

    var HEARTBEAT_FREQUENCY = 3000;

    var _socket = null;
    
    var heartbeat_id = null;

    function send_heartbeat() {
        _socket.emit("heartbeat-start",
                     {
                         hangout_id: window.gapi.hangout.getHangoutId(),
                         participant_id: window.gapi.hangout.getLocalParticipant().person.id
                     });
    }

    function startHeartbeat() {
        console.log("starting the heartbeat...");
        send_heartbeat();
        var heartbeat = window.setInterval(send_heartbeat, HEARTBEAT_FREQUENCY);
        return heartbeat;
    }

    function stopHeartBeat() {
        window.clearInterval(heartbeat_id);
        console.log("stopping the heartbeat...");
        _socket.emit('heartbeat-stop',
                    {
                        hangout_id: window.gapi.hangout.getHangoutId()
                    });
    }

    // tries to start sending a heartbeat to the server every
    // HEARTBEAT_FREQUENCY ms.
    // It will only start if there are no other participants in the hangout
    // with the app enabled.
    function maybeStartHeartbeat(participants) {
        // participants with app enabled
        var appParticipants = _.filter(participants,
                                       function(p) { return p.hasAppEnabled;});

        if (appParticipants.length == 1) {
            if (heartbeat_id) {
                // weirdness. means we're trying to start the heartbeat while
                // it's already going.
                console.log("ERROR, should never be here. continuing to send heartbeat...");
            } else {
                console.log("ERROR, only one participant, starting heartbeat..");
                heartbeat_id = startHeartbeat();
            }
        } else {
            // if we have more than one participant, then stop the
            // heartbeat.
            if (heartbeat_id) {
                console.log("Stopping heartbeat...");
                stopHeartBeat();
                heartbeat_id = null;
            }
        }
    }

    //TODO: How do we handle when someone joins???
    
    function registerHeartbeat(socket) {
        console.log("registering heartbeat listener");
        _socket = socket;
        window.gapi.hangout.onParticipantsChanged.add(function(event) {
            maybeStartHeartbeat(event.participants);
        });
    }

    return {
        register_heartbeat: registerHeartbeat,
        maybe_start_heartbeat: maybeStartHeartbeat
    };
});
