var feathers = require('feathers');
var bodyParser = require('body-parser');
var mongodb = require('feathers-mongodb');

// local modules
var services = require('./services');
var listener = require('./listener');

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
            // create all listeners
            listener.listen(socket);

            // do authentication here (eventually)
        });

        

    }))
    .use(bodyParser.json())
    .use('/hangouts', services.hangoutService)
    .use('/talking_history', services.talkingHistoryService)
    .use('/participant_events', services.participantEventService)
    .use('/', feathers.static(__dirname))
    .listen(3000);
