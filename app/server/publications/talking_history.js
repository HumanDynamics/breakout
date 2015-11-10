// Talking history data
// return sorted, with most recently created first, and limit it to
// 100 results.
Meteor.publish('talking_history', function() {
    return TalkingHistory.find({
//        sort: {createdAt: -1},
        limit: 100
    });
});

// Herfindahl indices
Meteor.publish('h_indices', function() {
    return HIndices.find({
        limit: 100,
    });
});
