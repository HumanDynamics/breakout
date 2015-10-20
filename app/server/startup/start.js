Meteor.startup(function() {
    // make fake talkers rn
    if (Talkers.find().count() === 0) {
        Talkers.insert({'talker': "talker1"});
    }
});
