import ParticipantActionCreators from '../actions/ParticipantActionCreators';
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

var participants = app.service('participants');

module.exports = {

    // get all participants from server
    getAllParticipants: function() {
        participants.find({}, function(error, foundParticipants) {
            console.log("[utils] received participants:", foundParticipants);
            ParticipantActionCreators.receiveAllParticipants(foundParticipants);
        });
    },

    registerCreatedCallback: function() {
        participants.on('created', function(participant) {
            console.log("[utils] new participant created:", participant);
            ParticipantActionCreators.receiveNewParticipant(participant);
        });
    },

    registerChangedCallback: function() {
        participants.on('patched', function(participant) {
            ParticipantActionCreators.receiveChangedParticipant(participant);
        });
    }
};
