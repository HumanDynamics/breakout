define(["primus", "gapi", "_", "hangoutUtils"], function(Primus, gapi, _, hangoutUtils) {

    // initialize global state object
    window.state = {};
    window.state.url = "breakout.media.mit.edu";

    // initialize primus with the server url
    var primus = new Primus(window.state.url);
    console.log("primus started on url:", window.state.url);

    
    primus.on('hangouts created', function(hangout) {
        console.log('Someone created a hangout', hangout);
    });


    
    console.log(gapi.hangout.getParticipants());

    var participantIds = _.map(gapi.hangout.getParticipants(),
                               function(p) {
                                   return p.person.id;
                               });
    var hangoutId;
    console.log("hangoututils:", hangoutUtils);
    var res = hangoutUtils.getHangout(gapi.hangout.getHangoutId(),
                                      gapi.hangout.getHangoutUrl(),
                                      participantIds,
                                      gapi.hangout.getTopic());
    hangoutId = res.id;
    

    // primus.send('hangouts::create', {title: 'HangoutTitle'}, {}, function() {
    //     primus.send('hangouts::find', {}, function(error, hangouts) {
    //         console.log(error);
    //         console.log(hangouts);
    //     });
    // });

    return {
        primus: primus
    };
});
