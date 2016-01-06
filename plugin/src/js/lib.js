define(["primus", "gapi"], function(Primus, gapi) {

    // initialize global state object
    window.state = {};
    window.state.url = "breakout.media.mit.edu";

    // initialize primus with the server url
    var primus = new Primus(window.state.url);
    console.log("primus started on url:", window.state.url);
    
    
    primus.on('hangouts created', function(hangout) {
        console.log('Someone created a hangout', hangout);
    });

    primus.send('hangouts::create', {title: 'HangoutTitle'}, {}, function() {
        primus.send('hangouts::find', {}, function(error, hangouts) {
            console.log(error);
            console.log(hangouts);
        });
    });

    return {
        primus: primus
    };
});
