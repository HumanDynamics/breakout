Meteor.methods({
    // returns a unique hangout ID for a given hangout URL
    // TODO
    // this is nontrivial because the hangoutUrl is only guaranteed to be
    // unique for the duration of a hangout, and no more.
    // We need to create a unique ID for each hangout that maps to something
    // the client can reference.
    // For now, just do findOne:
    'getHangout': function getHangoutId(hangoutUrl) {
        possible_hangout = Hangouts.findOne({'url': hangoutUrl});
        return possible_hangout;
    }
});
