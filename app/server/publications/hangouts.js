Meteor.publish('hangouts', function() {
    return Hangouts.find({limit: 20});
}
