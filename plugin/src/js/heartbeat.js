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

    function maybeStartHeartbeat(participants) {
        // participants with app enabled
        var appParticipants = _.filter(participants,
                                       function(p) { return p.hasAppEnabled;});
        
        if (appParticipants.length == 1) {
            if (heartbeat_id) {
                // weirdness. means participants changed to 
                console.log("ERROR, should never be here. continuing to send heartbeat...");
            } else {
                console.log("ERROR, weird, only one participant, starting heartbeat..");
                heartbeat_id = startHeartbeat();
            }
        } else {
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
