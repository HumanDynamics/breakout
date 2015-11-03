//TODO
// Talking data for a single hangout group.
//
// {talking: [uuid1, uuid2, ...], timestamp: <time>}
// snapshot of users talking at this timestamp.
Meteor.publish('talkers', function() {
    return Talkers.find({fields: {talker: 1}, limit: 20});
});

