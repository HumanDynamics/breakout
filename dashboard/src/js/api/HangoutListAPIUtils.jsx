import HangoutListActionCreators from '../actions/HangoutListActionCreators';
import AppDispatcher from '../dispatcher/dispatcher';
import HangoutListConstants from '../constants/HangoutListConstants';
import io from 'socket.io-client';
import feathers from 'feathers-client';

var ActionTypes = HangoutListConstants.ActionTypes;

var socket = io.connect('breakout-dev.media.mit.edu', {'transports': [
    'websocket',
    'flashsocket',
    'jsonp-polling',
    'xhr-polling',
    'htmlfile'
]});

var app = feathers().configure(feathers.socketio(socket));

var hangouts = app.service('hangouts');

function updateHangoutActive(hangoutDBId, active) {
    hangouts.patch(hangoutDBId, {'active': active}, {},
                   function(error, data) {
                       if (!error && data) {
                           console.log("Patched hangout active successfully");
                       }
                   });
}

// get all hangouts from server
function getAllHangouts() {
    hangouts.find({}, function(error, foundHangouts) {
        console.log("[utils] received hangouts:", foundHangouts, HangoutListActionCreators);
        HangoutListActionCreators.receiveAllHangouts(foundHangouts);
    });
};

function registerCreatedCallback() {
    hangouts.on('created', function(hangout) {
        console.log("[utils] new hangout created:", hangout);
        HangoutListActionCreators.receiveNewHangout(hangout);
    });
};

function registerChangedCallback() {
    hangouts.on('patched', function(hangout) {
        HangoutListActionCreators.receiveChangedHangout(hangout);
    });
};

function login(username, password) {
    app.authenticate({
        type: 'local', // may need to change for mongo
        username: username,
        password: password
    }).then(function(result) {
        console.log("result:", result);
    }).catch(function(error) {
    });
}



// Register Dispatcher for API events
AppDispatcher.register(function(payload) {
    switch( payload.type ) {
        case ActionTypes.UPDATE_HANGOUT_ACTIVE:
            updateHangoutActive(payload.hangoutDBId, payload.active);
    }
});


module.exports = {
    getAllHangouts: getAllHangouts,
    registerCreatedCallback: registerCreatedCallback,
    registerChangedCallback: registerChangedCallback,
    updateHangoutActive: updateHangoutActive
};
