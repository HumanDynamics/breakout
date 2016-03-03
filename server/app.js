var feathers = require('feathers');
var bodyParser = require('body-parser');
var mongodb = require('feathers-mongodb');
var hooks = require('feathers-hooks');
var winston = require('winston');

// export app as module so we can require it later.
var app = module.exports = feathers();

// local modules
var services = require('./services');
var listener = require('./listener');
var heartbeat = require('./heartbeat');
var my_hooks = require('./my_hooks');

app.configure(feathers.rest())
    .configure(hooks())
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
            heartbeat.listen_heartbeats(socket);
            // do authentication here (eventually)

            socket.on('disconnect', function() {
                winston.log("info", ">>>>>>>>Client disconnected");
            });

        });
    }))
    .use(bodyParser.json())
    .use('/hangouts', services.hangoutService)
    .use('/hangout_events', services.hangoutEventService)
    .use('/talking_history', services.talkingHistoryService)
    .use('/talk_times', services.talkTimeService)
    .use('/participants', services.participantService)
    .use('/participant_events', services.participantEventService)
    .use('/turns', services.turnService)
    .use('/transitions', services.turnService)
    .use('/', feathers.static(__dirname))
    .listen(3000);

my_hooks.configure_hooks(app);
