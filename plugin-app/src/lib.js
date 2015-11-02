// setting meteor server URL
window.meteorURL = "breakout.media.mit.edu";

// global state object
window.state = {};
window.googleLoaded = false;

state['conn'] = new Asteroid(window.meteorURL, true);


// returns a promise that is the meteor ID of this hangout.  If there
// is no appropriate hangout, meteor will creates a new one and
// returns that ID.
// of the form:
// {'id': id, 'isnew': boolean}
function getHangoutId() {
    // get participants
    var participantIds = _.each(gapi.hangout.getParticipants,
                                function(p) {
                                    return p.id;
                                });

    var hangoutId; 
    var res = state.conn.call('getHangout',
                              gapi.hangout.getHangoutId(),
                              "fillerUrl",
                              //gapi.hangout.getHangoutUrl(),
                              participantIds);

    return res.result;
}



var volumes = {};

// Events and code for hangout API, after it's ready.
gapi.hangout.onApiReady.add(function(eventObj) {

    // first, get the meteor ID for this hangout
    var hangoutIdPromise = getHangoutId()
    var hangoutId;
    var isHangoutNew;
    hangoutIdPromise.then(function(result) {
        console.log("got hangout id:", result);
        hangoutId = result.id;
        isHangoutNew = result.isnew;
    }, function(error) {
        console.log("Couldn't get hangout ID: ", error);
    });


    
    // volumes

    var volumes = [];
    var thisParticipant = gapi.hangout.getLocalParticipantId();
    var talkState = {'talking': false, 'time': null}

    // constants for talking 'algorithm'
    var MIN_VOLUME = 2;
    var MIN_SILENCE_LENGTH = 500;
    var MIN_TALK_LENGTH = 500;


    // returns the number of ms between index i and the most recent
    // last talk event
    // TODO: These two can be abstracted out
    function timeSinceLastTalk(i) {
        _.each(volumes, function(e, i, l) {
            if (e.vol > MIN_VOLUME) {
                return volumes[i].timestamp - e.timestamp;
            } else {
                continue;
            }
        });
    }

    // TODO: abstract out
    function timeSinceLastQuiet(i) {
        _.each(volumes, function(e, i, l) {
            if (e.vol < MIN_VOLUME) {
                return volumes[i].timestamp - e.timestamp;
            } else {
                continue;
            }
        });
    }

    // returns true if the user has stopped talking.  defines 'stopped
    // talking' as the user not having a volume event greater than
    // MIN_VOLUME for over MIN_SILENCE_LENGTH milliseconds.
    function stoppedTalking() {
        if (volumes[volumes.length].vol <= MIN_VOLUME) {
            return timeSinceLastTalk(volumes.length) > MIN_SILENCE_LENGTH;
        }
        return false;
    }

    function startedTalking() {
        if (volumes[volumes.length].vol > MIN_VOLUME) {
            return timeSinceLastQuiet(volumes.length) > MIN_TALK_LENGTH;
        }
    }

    function getTalkTime() {
        // use startedTalking here
        // to get the talk time if an event is in the volumes buffer
    }
    
    // if the current value of `volumes` contains a distinct talk
    // event, send it to the server and remove it from the list.
    function checkTalkEvent() {
        if (talkState.talking) {
            if (stoppedTalking()) {
                talkState.talking = false;
                lastTime = volumes[volumes.length].timestamp - timeSinceLastTalk(volumes.length);

                // start and end of talking!
                console.log("new talk event:", talkState.time, lastTime);
            }
        }
        if (_.last(volumes) > 0) {
            talkState.talking = True
        }
    }

    gapi.hangout.av.onVolumesChanged.add(
        function(evt) {
            console.log("volumes changed...", evt.volumes);
            var volumes = evt.volumes;
            _.each(volumes, function(v, k, l) {
                
                // if it's below 2, map it to 0.
                if (k == thisParticipant) {
                    var time = Date.now();
                    volumes.push({'val': v,
                                  'timestamp': time});
                }
                checkTalkEvent();
                
                console.log(v, k);
            });
        }
    );
});
