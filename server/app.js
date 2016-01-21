var feathers = require('feathers');
var bodyParser = require('body-parser');
var mongodb = require('feathers-mongodb');
var winston = require('winston');

// local modules
var services = require('./services');
var listener = require('./listener');
var heartbeat = require('./heartbeat');

var app = feathers();

app.configure(feathers.rest())
    .configure(feathers.socketio(function(io) {

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
            global.socket = socket;
            // create all listeners
            listener.listen(socket);
            heartbeat.listen_heartbeats(global.socket);
            // do authentication here (eventually)
        });

        

    }))
    .use(bodyParser.json())
    .use('/hangouts', services.hangoutService)
    .use('/hangout_events', services.hangoutEventService)
    .use('/talking_history', services.talkingHistoryService)
    .use('/talktimes', services.talkTimeService)
    .use('/participants', services.participantService)
    .use('/participant_events', services.participantEventService)
    .use('/', feathers.static(__dirname))
    .listen(3000);
