// Router.route('/', function() {
//     this.render('plugin');
// });

// Router.route('/', function () {
//     this.render('Home', {
//         data: function () { return Items.findOne({_id: this.params._id}); }
//     });
// });

Router.route('serverRoute', {
    path: '/',
    where: 'server',
    action: function() {
        var contents = Assets.getText('public/index.html');
        this.response.end(contents);
    }
});

// Router.route('/', function() {
//     this.response.sendfile('/index.html');
//     // action: function() {
//     //     var path = this.params.path;
//     //     this.response.sendfile(path);
//     // }
// });
