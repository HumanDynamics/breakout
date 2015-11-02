Meteor.methods({
    // returns a unique hangout ID for a given hangout URL
    // TODO
    // this is nontrivial because the hangoutUrl is only guaranteed to be
    // unique for the duration of a hangout, and no more.
    // We need to create a unique ID for each hangout that maps to something
    // the client can reference.
    // For now, just do findOne:
    'getHangout': function getHangoutId(hangoutId, hangoutUrl, participants) {
        possible_hangout = Hangouts.findOne({'hangout_id': hangoutId});
        console.log("finding hangout with id: ", hangoutId);
        console.log("found possible hangout: ", possible_hangout);
        if (possible_hangout) {
            return {'id': possible_hangout._id,
                    'new': false};
        } else {
            // no existing hangout, let's make another
            return {'id': Hangouts.insert({'hangout_id': hangoutId,
                                           'url': hangoutUrl,
                                           'participants': participants,
                                           'start_time': Date.now(),
                                           'end_time': null,
                                           'active': true,
                                          }),
                    'new': true};
        }
    }
});
