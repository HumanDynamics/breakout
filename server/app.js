var feathers = require('feathers');
var mongodb = require('feathers-mongodb');
var bodyParser = require('body-parser');

var app = feathers();

var services = require('./services.js');

app.use('/hangouts', services);

app.use('/talking-history', services.talkingHistoryService);

app.use('/participants', services.participantService);

app.use('/volumes', services.volumeService);

app.use('/herfindahl-indices', services.hIndexService);



// Configure REST and SocketIO endpointss
app.configure(feathers.rest());
app.configure(feathers.primus({
    transformers: 'socketio'
}));

// Parse JSON and form HTTP bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Start on port 3030
app.listen(3030);
