var feathers = require('feathers');
var mongodb = require('feathers-mongodb');
var bodyParser = require('body-parser');

var app = feathers();

var services = require('./services.js');

app.use('/hangouts', services);

app.use('/talking-history', talkingHistoryService);

app.use('/participants', participantService);

app.use('/volumes', volumeService);

app.use('/herfindahl-indices', hIndexService);



// Configure REST and SocketIO endpointss
app.configure(feathers.rest());
app.configure(feathers.socketio());

// Parse JSON and form HTTP bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Start on port 3030
app.listen(3030);
