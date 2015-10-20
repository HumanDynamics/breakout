Template.plugin.helpers({
    talkers: function() {
        return Template.instance().talkers();
    },
});

Template.plugin.onCreated(function() {
    var instance = this;

    var talkerSubscription = instance.subscribe('talkers');

    instance.talkers = function() {
        return Talkers.find({});
    };
});

