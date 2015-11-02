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
// {'id': id, 'new': boolean}
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

gapi.hangout.onApiReady.add(function(eventObj) {

    // get the hangout ID
    var hangoutIdPromise = getHangoutId()
    var hangoutId;
    hangoutIdPromise.then(function(result) {
        console.log("got hangout id:", result);
        hangoutId = result;
    }, function(error) {
        console.log("Couldn't get hangout ID: ", error);
    });


    gapi.hangout.av.onVolumesChanged.add(
        function(evt) {
            console.log("volumes changed...");
        }
    );
});
