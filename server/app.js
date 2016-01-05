var feathers = require('feathers');
var bodyParser = require('body-parser');
var mongodb = require('feathers-mongodb');

// local modules
var services = require('./services');

var app = feathers();

app.configure(feathers.rest())
    .configure(feathers.primus({
        transformers: 'socketio'
    }))
    .use(bodyParser.json())
    .use('/hangouts', services.hangoutService)
    .use('/talking_history', services.talkingHistoryService)
    .use('/', feathers.static(__dirname))
    .listen(3000);

// app.configure(feathers.rest())
//     .configure(feathers.primus({
//         transformers: 'socketio'
//     }))
//     // Parse JSON and form HTTP bodies
//     .use(bodyParser.json())
//     .use(bodyParser.urlencoded({ extended: true }))
//     // routing
//     .use('/hangouts', services)
//     .use('/talking-history', services.talkingHistoryService)
//     .use('/participants', services.participantService)
//     .use('/volumes', services.volumeService)
//     .use('/herfindahl-indices', services.hIndexService)
//     .listen(3030);



// // Configure REST and SocketIO endpointss
// app.configure(feathers.rest());
// app.configure(feathers.primus({
//     transformers: 'socketio'
// }));

// // Parse JSON and form HTTP bodies
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // Start on port 3030
// app.listen(3030);
