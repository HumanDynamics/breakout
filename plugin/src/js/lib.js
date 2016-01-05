define(["primus"], function(Primus) {

    window.state = {};
    window.state.url = "breakout.media.mit.edu";
    console.log("primus:", Primus);
    var primus = new Primus(window.state.url);

    console.log("window url:", window.state.url);
    primus.on('hangouts created', function(hangout) {
        console.log('Someone created a hangout', hangout);
    });

    primus.send('hangouts::create', {title: 'HangoutTitle'}, {}, function() {
        primus.send('hangouts::find', {}, function(error, hangouts) {
            console.log(hangouts);
        });
    });

    return {
        primus: primus
    };
}
