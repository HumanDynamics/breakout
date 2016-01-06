define(["primus",  "underscore", "gapi", "hangoutUtils"], function(Primus, _, gapi, hangoutUtils) {

    // initialize global state object
    window.state = {};
    window.state.url = "breakout.media.mit.edu";

    // initialize primus with the server url
    var primus = new Primus(window.state.url);
    console.log("primus started on url:", window.state.url);

    
    primus.on('hangouts created', function(hangout) {
        console.log('Someone created a hangout', hangout);
    });


    console.log("gapi:", window.gapi);
    window.gapi.hangout.onApiReady.add(function(eventObj) {
        console.log("gapi:", window.gapi);
        
        console.log(window.gapi.hangout.getParticipants());

        var participantIds = _.map(window.gapi.hangout.getParticipants(),
                                   function(p) {
                                       return p.person.id;
                                   });
        hangoutUtils.getHangoutId(window.gapi.hangout.getHangoutId(),
                                  window.gapi.hangout.getHangoutUrl(),
                                  participantIds,
                                  window.gapi.hangout.getTopic());
        console.log('hangoutid:', window.state.hangoutId);
    });

    

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
