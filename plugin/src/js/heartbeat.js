// Listener registeres all the primus listeners for this plugin
// instance.
define(["underscore"], function(underscore) {

    var _socket = null;
    
    var heartbeat_id = null;
    function startHeartbeat() {
        console.log("starting the heartbeat...");
        var heartbeat = window.setInterval(function() {
            _socket.emit("heartbeat-start",
                        {
                            hangout_id: window.gapi.hangout.getHangoutId(),
                            participant_id: window.gapi.hangout.getLocalParticipant().person.id
                        });
        }, 5000);
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

    function maybeStartHeartbeat(participantsChangedEvent) {
        if (participantsChangedEvent.participants.length == 1) {
            if (heartbeat_id) {
                // weirdness. means participants changed to 
                console.log("ERROR, should never be here. continuing to send heartbeat...");
            }
            heartbeat_id = startHeartbeat();
        } else {
            if (heartbeat_id) {
                stopHeartBeat();
                heartbeat_id = null;
            }
        }
    }

    //TODO: How do we handle when someone joins???
    
    function registerHeartbeat(socket) {
        console.log("registering heartbeat listener");
        _socket = socket;
        window.gapi.hangout.onParticipantsChanged.add(maybeStartHeartbeat);
    }

    return {
        register_heartbeat: registerHeartbeat,
        maybe_start_heartbeat: maybeStartHeartbeat
    };
});
