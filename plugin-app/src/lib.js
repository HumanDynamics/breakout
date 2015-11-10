// setting meteor server URL
window.meteorURL = "breakout.media.mit.edu";

// global state object
window.state = {};
window.googleLoaded = false;

state['conn'] = new Asteroid(window.meteorURL, true);

state.conn.subscribe('talking_history');
state['talkingHistoryCollection'] = state.conn.getCollection('talking_history')


state.conn.subscribe('h_indices');
state['herfindahlIndexCollection'] = state.conn.getCollection('h_indices');



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
                              //"fillerUrl",
                              gapi.hangout.getHangoutUrl(),
                              participantIds);

    return res.result;
}


var volumes = {};


function setupSubscriptions(hangoutId) {
    console.log("setting up subscriptions...");
    state['herfindahlRQ'] = state.talkingHistoryCollection.reactiveQuery({});//{'hangout_id': hangoutId});
    console.log('hindex for hangout id:', hangoutId, state.herfindahlRQ.result);

    // state.herfindahlRQ.on('change', function(id) {
    //     state['hIndex'] = state.herfindahlRQ.result;
    //     console.log("new h-index:", state.hIndex);
    // });
}


// Events and code for hangout API, after it's ready.
gapi.hangout.onApiReady.add(function(eventObj) {

    // first, get the meteor ID for this hangout
    var hangoutIdPromise = getHangoutId()
    var hangoutId;
    var isHangoutNew;
    hangoutIdPromise.then(function(result) {
        console.log("got hangout id:", result);
        hangoutId = result.id;
        state['hangoutId'] = result.id;
        isHangoutNew = result.isnew;

        console.log("setting up subscriptions...");
        setupSubscriptions(hangoutId);
        
    }, function(error) {
        console.log("Couldn't get hangout ID: ", error);
    });


    
    // volumes

    var volumes = [];
    var thisParticipant = gapi.hangout.getLocalParticipantId();
    var talkState = {'talking': false, 'time': null}

    // constants for talking 'algorithm'
    var MIN_VOLUME = 2; // minimum volume to count
    // if at least this amount of time happens between a talk signal
    // and a null signal, they are considered to have stopped talking.
    var MIN_SILENCE_LENGTH = 1000;
    // if at least this amount of time happens between a null signal
    // and a talk signal, they are considered to have started talking.
    var MIN_TALK_LENGTH = 500;

    // If we get no signal for this amount of time, consider them no
    // longer talking.
    var TALK_TIMEOUT = 1500;


    // returns the number of ms between index i and the most recent
    // last talk event
    // TODO: These two can be abstracted out
    function timeSinceLastTalk(i) {
        for (var j = i - 1; j >= 0; j--) {
            if (volumes[j].vol > MIN_VOLUME) {
                return volumes[i].timestamp - volumes[j].timestamp;
            }
        }
    }

    // TODO: abstract out
    function timeSinceLastQuiet(i) {
        for (var j = i - 1; j >= 0; j--) {
            if (volumes[j].vol < MIN_VOLUME) {
                return volumes[i].timestamp - volumes[j].timestamp;
            }
        }
    }

    // returns true if the user has stopped talking.  defines 'stopped
    // talking' as the user not having a volume event greater than
    // MIN_VOLUME for over MIN_SILENCE_LENGTH milliseconds.
    function stoppedTalking() {
        if (volumes[volumes.length - 1].vol <= MIN_VOLUME) {
            return timeSinceLastTalk(volumes.length - 1) > MIN_SILENCE_LENGTH;
        }
        return false;
    }
    
    function startedTalking() {
        if (volumes[volumes.length - 1].vol > MIN_VOLUME) {
            //console.log("over min volume threshold, testing time..");
            var res = timeSinceLastQuiet(volumes.length - 1) > MIN_TALK_LENGTH;
            //console.log("time since quiet:", timeSinceLastQuiet(volumes.length - 1));
            return res;
        }
    }

    function insertTalkEvent(startTime, endTime, volumeData) {
        state.talkingHistoryCollection.insert({
            'participant_id': thisParticipant,
            'hangout_id': hangoutId,
            'start_time': new Date(startTime),
            'end_time': new Date(endTime),
            //'volumes': volumeData
        });
    }

    // if the current value of `volumes` contains a distinct talk
    // event, send it to the server and remove it from the list.
    function checkTalkEvent() {
        if (volumes.length < 3) {
            //console.log("no volumes to examine, continuing...");
            return;
        }
        if (talkState.talking) {
            //console.log("currently talking...");
            // Talking -> not talking
            if (stoppedTalking()) {
                talkState.talking = false;
                // get the last time talking
                lastTime = volumes[volumes.length - 1].timestamp - timeSinceLastTalk(volumes.length - 1);
                // start and end of talking!
                console.log("new talk event:", talkState.time, lastTime);
                insertTalkEvent(talkState.time, lastTime, volumes);
                volumes = [];
                
            }
        } else if (!talkState.talking) {
            //console.log("not talking...");
            if (startedTalking()) {
                //console.log("just started talking!");
                talkState.time = Date.now();
                talkState.talking = true;
            }
        }
    }

    gapi.hangout.av.onVolumesChanged.add(
        function(evt) {
            //console.log("volumes changed...", evt.volumes);
            var eventVolumes = evt.volumes;
            _.each(eventVolumes, function(v, k, l) {
                if (k == thisParticipant) {
                    //console.log(v, k, thisParticipant);
                    var time = Date.now();
                    volumes.push({'vol': v,
                                  'timestamp': time});
                    // console.log(volumes[volumes.length - 1]);
                    // console.log(volumes.length);
                }
                checkTalkEvent();
                
            });
        }
    );


    
    // setInterval(function() {
    //     console.log("h-index: ", getHerfindahlIndex(hangoutId));
    // }, 11000);

    // check if it's been over TALK_TIMEOUT ms since we last got an
    // event. If so, then they're not talking.
    setInterval(function() {
        if (talkState.talking) {
            var now = Date.now()
            var lastEventTime = volumes[volumes.length - 1].timestamp;
            if ((now - lastEventTime) > TALK_TIMEOUT) {
                console.log("stopped talking...");
                talkState.talking = false;
                lastTime = volumes[volumes.length - 1].timestamp - timeSinceLastTalk(volumes.length - 1);
                console.log("new talk event (timeout):", talkState.time, lastTime);
                insertTalkEvent(talkState.time, lastTime, volumes);
                volumes = [];
            }
        }
    }, 50);
});
