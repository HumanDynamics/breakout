import _ from 'underscore';
//var EventEmitter = require('events').EventEmitter;
import MicroEvent from 'microevent';

import AppDispatcher from '../dispatcher/dispatcher';
import ParticipantConstants from '../constants/ParticipantConstants';


var ActionTypes = ParticipantConstants.ActionTypes;
var CHANGE_EVENT = 'change';



class _ParticipantStore {
    constructor() {
        this.participants = [];
    }

    // actually return an object.
    getAll() {
        return participants;
    }

    getParticipantsByHangout() {
        return _.groupBy(this.participants, 'hangout_id');
    }
            
    get(participant_id) {
        return _.filter(this.participants,
                        (p) => p.participant_id == participant_id);
    }

    getParticipantsFromHangout(hangout_id) {
        return _.filter(this.participants,
                        (p) => p.hangout_id == hangout_id);
    }
}

MicroEvent.mixin(_ParticipantStore);


var ParticipantStore = new _ParticipantStore();


function _addParticipant(participant) {
    ParticipantStore.participants.push(participant);
}

function _addParticipants(participants) {
    _.each(participants, function(participant) {
        _addParticipant(participant);
    });
}



AppDispatcher.register(function(payload) {
    switch( payload.type ) {
        case ActionTypes.RECEIVE_ALL_PARTICIPANTS:
            console.log("received participants");
            _addParticipants(payload.participants);
            ParticipantStore.trigger(CHANGE_EVENT);
            break;
        case ActionTypes.RECEIVE_NEW_PARTICIPANT:
            _addParticipant(payload.participant);
            ParticipantStore.trigger(CHANGE_EVENT);
            break;
        case ActionTypes.RECEIVE_CHANGED_PARTICIPANT:
            console.log("[participantStore] NOT IMPLEMENTED");
            //_replaceParticipant(payload.participant);
            //ParticipantStore.trigger(CHANGE_EVENT);
            break;
        default:
            
    }
    
    return true;
});

exports.ParticipantStore = ParticipantStore;
