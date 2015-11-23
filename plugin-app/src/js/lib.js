define(["scripts/volumeCollector"], function(volumeCollector) {

    // setting meteor server URL
    window.meteorURL = "breakout.media.mit.edu";

    // global state object
    window.state = {};
    window.googleLoaded = false;

    // Asteroid initialization
    state['conn'] = new Asteroid(window.meteorURL, true);

    // subscribe to talking_history
    state.conn.subscribe('talking_history');
    state['talkingHistoryCollection'] = state.conn.getCollection('talking_history')

    // subscribe to h_indices
    state.conn.subscribe('h_indices');
    state['hIndexCollection'] = state.conn.getCollection('h_indices');

    state['collectingVolumes'] = true; // true if we're currently collecting data
    state['silenceDetector'] = null; // interval ID of the silence detector.

    // returns a promise that is the meteor ID of this hangout.  If there
    // is no appropriate hangout, meteor will creates a new one and
    // returns that ID.
    // of the form:
    // {'id': id, 'isnew': boolean}
    state['getHangoutId'] = function() {
        // return if we already have it
        if ('hangoutId' in state) {
            return state.hangoutId;
        }
        // get participants (GIDs)
        var participantIds = _.map(gapi.hangout.getParticipants(),
                                   function(p) {
                                       return p.person.id;
                                   });
        var hangoutId;
        var res = state.conn.call('getHangout',
                                  gapi.hangout.getHangoutId(),
                                  gapi.hangout.getHangoutUrl(),
                                  participantIds,
                                  gapi.hangout.getTopic());
        return res.result;
    }

    // local buffering for volume data


    //TODO: none of this works, basically :(
    // called after the hangoutID promise has been hit.
    function setupSubscriptions(hangoutId) {
        console.log("setting up subscriptions for hangout: ", hangoutId);

        state['herfindahlRQ'] = state.hIndexCollection.reactiveQuery(function(item) {
            return item.hangout_id == hangoutId;
        });

        console.log('hindex for hangout id:', hangoutId, state.herfindahlRQ.result);

        console.log("herfindahl RQ:", state.herfindahlRQ.result);

        state.herfindahlRQ.on("change", function(id) {
            console.log("herfindahl on changed!");
            console.log("changed result:", state.herfindahlRQ.result);
        });

        state['talkingHistoryRQ'] = state.talkingHistoryCollection.reactiveQuery(function(item) {
            return true;
        });

        state.talkingHistoryRQ.on("change", function(id) {
            console.log("talking history changed!");
        });
    }


    // var volumeCollector = volumeCollector;
    // Events and code for hangout API, after it's ready.
    gapi.hangout.onApiReady.add(function(eventObj) {
        // first, get the meteor ID for this hangout
        var hangoutIdPromise = state.getHangoutId()
        var hangoutId;
        var isHangoutNew;

        state['localParticipant'] = gapi.hangout.getLocalParticipant().person.id;

        hangoutIdPromise.then(function(result) {
            console.log("got hangout id:", result);
            hangoutId = result.id;
            state['hangoutId'] = result.id;
            isHangoutNew = result.isnew;
            setupSubscriptions(hangoutId);
        }, function(error) {
            console.log("Couldn't get hangout ID: ", error);
        });


        // gapi.hangout.onEnabledParticipantsChanged.add(function() {
        //   var users = gapi.hangout.onParticipantsChanged.add(function(evt) {
        //     console.log"participants changed:",
        //     function(ParticipantsChangedEvent)
        //
        //   });
        // });

        // start the volume collector
        state['collectingVolumes'] = true;
        volumeCollector.startVolumeCollection(hangoutId);
    });

    return {
        getHangoutId: state.getHangoutId,
    }
});
