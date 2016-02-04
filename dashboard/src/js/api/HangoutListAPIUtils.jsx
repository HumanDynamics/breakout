import HangoutListActionCreators from '../actions/HangoutListActionCreators';
import io from 'socket.io-client';
import feathers from 'feathers-client';

var socket = io.connect('breakout-dev.media.mit.edu', {'transports': [
    'websocket',
    'flashsocket',
    'jsonp-polling',
    'xhr-polling',
    'htmlfile'
]});
var app = feathers().configure(feathers.socketio(socket));

var hangouts = app.service('hangouts');

module.exports = {

    // get all hangouts from server
    getAllHangouts: function() {
        hangouts.find({}, function(error, foundHangouts) {
            console.log("[utils] received hangouts:", foundHangouts);
            HangoutListActionCreators.receiveAllHangouts(foundHangouts);
        });
    },

    registerCreatedCallback: function() {
        hangouts.on('created', function(hangout) {
            console.log("[utils] new hangout created:", hangout);
            HangoutListActionCreators.receiveNewHangout(hangout);
        });
    },

    registerChangedCallback: function() {
        hangouts.on('patched', function(hangout) {
            HangoutListActionCreators.receiveChangedHangout(hangout);
        });
    }
};
