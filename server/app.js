var feathers = require('feathers');
var service = require('feathers-mongodb');
var hooks = require('feathers-hooks');
var rest = require('feathers-rest');
var socketio = require('feathers-socketio');
var bodyParser = require('body-parser');
var winston = require('winston');
var MongoClient = require('mongodb').MongoClient;

// export app as module so we can require it later.
var app = module.exports = feathers();

// local modules
var listener = require('./listener');
var heartbeat = require('./heartbeat');
var my_hooks = require('./my_hooks');

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


// connect to mongo services
MongoClient.connect('mongodb://localhost:27017/feathers', function(error, db) {
    
    // Each item in Hangouts is of the form:
    // 'participants': [user_id1, user_id2, ...]
    // 'start_time':   timestamp of start of hangout
    // 'end_time':     timestamp of end of hangout, or null
    // 'url':          URL of hangout
    // 'hangout_id':   ID of hangout
    // 'active':       boolean whether hangout is currently active
    app.use('/hangouts', service({
        Model: db.collection('hangouts')
    }));

    // Speaking history item for a particular hangout.
    // of the form:
    // 'participant_id': meteor participant ID
    // 'hangout_id':     meteor hangout ID of talk event
    // 'start_time':     timestamp of beginning of talking period
    // 'end_time':       timestamp of eend of talking period
    //? 'volumes':       raw volume data of this talk event from the google hangout    
    app.use('/talking_history', service({
        Model: db.collection('talking_history')
    }));

    // Number of ms spoken since start of hangout by each participant.
    // Objects are of the form:
    // 'hangout_id': hangout ID
    // 'talk_times': {<participant_id>: <ms spoken>}
    // 'timestamp': timestamp of this calculation    
    app.use('/talk_times', service({
        Model: db.collection('talk_times')
    }));

    // Participants in hangouts -- every time there is a change.
    // 'name':      Name of talker
    // 'image':       Google profile image url
    // 'hangout_id':  Hangout ID the participant was in
    // 'participant_id':         Google ID for this participant.
    // 'consent': whether or not we have consent from the participant
    // unique hangout ID for this participant.
    app.use('/participants', service({
        Model: db.collection('participants')
    }));

    // Logs of participant list for each hangout
    // 'participants': list of google ID of each participant
    // 'hangout_id':   id of hangout
    // 'timestamp':    time of the event
    app.use('/participant_events', service({
        Model: db.collection('participant_events')
    }));

    // Logs of hangout-level events.
    // 'hangout_id': id of hangout
    // 'timestamp':  timestamp of event
    // 'event':      event type. one of:
    // 'end', 'start'
    // (hangouts can end and start multiple times).
    app.use('/hangout_events', service({
        Model: db.collection('hangout_events')
    }));
    
    // Number of turns for each participant in each hangout
    // of the form:
    // 'timestamp': timestamp of this event
    // 'hangout_id': hangout id this was calculated for
    // 'from': from time
    // 'to': to time
    // 'turns': {<participant_id>: <# of turns>}
    app.use('/turns', service({
        Model: db.collection('turns')
    }));

    
    app.use('/transitions', service({
        Model: db.collection('transitions')
    }));


    // Configure hooks on top of services
    my_hooks.configure_hooks(app);
});

app.use('/', feathers.static(__dirname));

app.listen(3000);


