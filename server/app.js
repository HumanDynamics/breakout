var feathers = require('feathers');
var bodyParser = require('body-parser');
require('./services.js');

var app = feathers();

// Configure REST and SocketIO endpointss
app.configure(feathers.rest());
app.configure(feathers.socketio());

// Parse JSON and form HTTP bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Start on port 3030
app.listen(3030);
