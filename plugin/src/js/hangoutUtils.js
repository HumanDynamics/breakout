define(["primus"], function(Primus) {
    var primus = new Primus("breakout.media.mit.edu");
    var getHangout = function(hangoutId, hangoutUrl, participants, hangoutTopic) {
        // if we've already cached it
        if ('hangoutId' in window.state) {
            console.log("hangoutid already cached:", window.state.hangoutId);
            return window.state.hangoutId;
        }
        // otherwise, let's try and find one
        primus.send("hangouts::find",
                    {$limit: 1, 'hangout_id': hangoutId},
                    function(error, hangout) {
                        var possible_hangout;
                        if (error || hangout.length == 0) {
                            possible_hangout = null;
                        } else {
                            possible_hangout = hangout;
                        }

                        // we have one that matches the ID, return it
                        if (possible_hangout) {
                            console.log("possible hangout:", possible_hangout);
                            window.state['hangoutId'] = {'id': possible_hangout._id,
                                                         'isnew': false};
                            console.log("hangout already in db:", window.state.hangoutId);
                        } else {
                            primus.send("hangouts::create",
                                        {'hangout_id': hangoutId,
                                         'url': hangoutUrl,
                                         'participants': participants,
                                         'start_time': new Date(),
                                         'hangoutTopic': hangoutTopic,
                                         'end_time': null,
                                         'active': true
                                        }, function(error, hangout) {
                                            window.state['hangoutId'] =  {'id': hangout._id,
                                                                          'isnew': true};
                                            console.log("hangoutid:", window.state.hangoutId);
                                        });
                        }
                    });
    };

    // Exports
    return {
        getHangoutId: getHangout
    };
});
