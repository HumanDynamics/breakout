import _ from 'underscore';
//var EventEmitter = require('events').EventEmitter;
import MicroEvent from 'microevent';

import AppDispatcher from '../dispatcher/dispatcher'
import HangoutListConstants from '../constants/HangoutListConstants';


var ActionTypes = HangoutListConstants.ActionTypes;
var CHANGE_EVENT = 'change';



class _HangoutStore {
    constructor() {
        this.hangouts = {};
    }

    getAll() {
        return _.values(this.hangouts) || [];
//        return this.hangouts;
    }

    get(id) {
        return this.hangouts[id];
    }
}

MicroEvent.mixin(_HangoutStore);


var HangoutStore = new _HangoutStore();

function _addHangouts(hangouts) {
    _.each(hangouts, function(hangout) {
        if (!_.has(HangoutStore.hangouts, hangout.hangout_id)) {
            HangoutStore.hangouts[hangout.hangout_id] = hangout;
        }
    });
}


AppDispatcher.register(function(payload) {
    switch( payload.eventName ) {
        case ActionTypes.RECEIVE_ALL_HANGOUTS:
            console.log("[hangoutStore] Received all hangouts:", payload);
            _addHangouts(payload.hangouts);
            HangoutStore.trigger(CHANGE_EVENT);
            break;
        case ActionTypes.RECEIVE_NEW_HANGOUT:
            HangoutStore.hangouts.push( payload.newHangout );
            HangoutStore.trigger(CHANGE_EVENT);
            break;
        default:
            
    }
    
    return true;
});

exports.HangoutStore = HangoutStore;
