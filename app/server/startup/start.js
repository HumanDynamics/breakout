Meteor.startup(function() {
    // make fake talkers rn
    if (Talkers.find().count() === 0) {
        Talkers.insert({'talker': "talker1"});
    }

    
    WebApp.connectHandlers.use(function(req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        return next();
    });
});




