var feathers = require('feathers');
var service = require('feathers-mongodb');
var hooks = require('feathers-hooks');
var rest = require('feathers-rest');
var socketio = require('feathers-socketio');
var bodyParser = require('body-parser');
var winston = require('winston');
var mongoose = require('mongoose');
var service = require('feathers-mongoose');
var MongoClient = require('mongodb').MongoClient;

// export app as module so we can require it later.
var app = module.exports = feathers();

// local modules
var listener = require('./listener');
var heartbeat = require('./heartbeat');
var my_hooks = require('./my_hooks');
var filters = require('./filters');

// models
var models = require('./models');


app.configure(rest())
.configure(hooks())
    .configure(socketio(function(io) {

        // enable all transports (optional if you want flashsocket support, please note that some hosting
        // providers do not allow you to create servers that listen on a port different than 80 or their
        // default port)
        io.set('transports', [
            'websocket'
            , 'flashsocket'
            , 'htmlfile'
            , 'xhr-polling'
            , 'jsonp-polling'
        ]);

        io.on('connection', function(socket) {
            // create all listeners
            listener.listen(socket);
            heartbeat.listen_heartbeats(socket);
            // do authentication here (eventually)

            socket.on('disconnect', function() {
                winston.log("info", ">>>>>>>>Client disconnected");
            });

        });
    }))
   .use(bodyParser.json());


mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/feathers');

app.use('/meetings', service({ Model: models.meeting }));
app.use('/utterances', service({ Model: models.utterance }));
app.use('/utterance_distributions', service({ Model: models.utteranceDistribution}));
app.use('/participants', service({ Model: models.participant }));
app.use('/participant_events', service({ Model: models.participantEvent }));
app.use('/meeting_events', service({ Model: models.meetingEvent }));
app.use('/turns', service({ Model: models.turn }));

// Configure hooks on top of services
my_hooks.configure_hooks(app);
filters.configure_filters([filters.crypto_filter],
    [
        'turns',
        'talking_history',
        'hangout_events',
        'participants',
        'participant_events',
        'hangouts'
    ]);

app.use('/', feathers.static(__dirname));

//app.listen(3000);
