// setting meteor server URL
window.meteorURL = "breakout.media.mit.edu";

// global state object
window.state = {};
window.googleLoaded = false;

state['conn'] = new Asteroid(window.meteorURL, true);

gapi.hangout.onApiReady.add(function(eventObj) {

    // get this hangout ID
    var hangoutRes = state.conn.call('getHangout', [gapi.hangout.getHangoutUrl()]);
    var hangoutId = hangoutRes.result;
    console.log("[global] got hangout ID:", hangoutId);
    
    
    gapi.hangout.av.onVolumesChanged.add(
        function(evt) {
            // TODO
        }
    );
});
