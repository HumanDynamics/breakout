define(["primus", "gapi"], function(Primus, gapi) {
    var primus = new Primus("breakout.media.mit.edu");
    function getHangout(hangoutId, hangoutUrl, participants, hangoutTopic) {
        // if we've already cached it
        if ('hangoutId' in window.state) {
            return window.state.hangoutId;
        }
        // otherwise, let's try and find one
        return primus.send("hangouts::find",
                           {$limit: 1, 'hangout_id': hangoutId},
                           function(error, hangout) {
                               var possible_hangout;
                               if (error) {
                                   possible_hangout = null;
                               } else {
                                   possible_hangout = hangout;
                               }

                               // we have one that matches the ID, return it
                               if (possible_hangout) {
                                   return {'id': possible_hangout._id,
                                           'isnew': false};
                               } else {
                                   return primus.send("hangouts::create",
                                                      {'hangout_id': hangoutId,
                                                       'url': hangoutUrl,
                                                       'participants': participants,
                                                       'start_time': new Date(),
                                                       'hangoutTopic': hangoutTopic,
                                                       'end_time': null,
                                                       'active': true
                                                      }, function(error, hangout) {
                                                          return {'id': hangout._id,
                                                                  'isnew': true};
                                                      });
                               }
                           });
    }

    // Exports
    return {
        getHangoutId: getHangout
    };
});
