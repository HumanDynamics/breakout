// Following data for a single hangout group.
// {followers: {user1: {user:<uuid>, value: <value>}}, timestamp: <time>}
// where:
// user1 is the user being responded to
// each object corresponds to a user that is responding to user1
// user: uuid of the user responding to user1
// value: 'score' or weight of their response pattern to user1

// this is a "snapshot" of followers for the given timestamp.

Meteor.publish('followers', function() {
    return Followers.find({
        fields: {followers: 1},
        sort: {createdAt: -1},
        limit: 20
    });
});

