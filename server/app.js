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
