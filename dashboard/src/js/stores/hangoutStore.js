import _ from 'underscore';
//var EventEmitter = require('events').EventEmitter;
import MicroEvent from 'microevent';

import AppDispatcher from '../dispatcher/dispatcher';
import HangoutListConstants from '../constants/HangoutListConstants';


var ActionTypes = HangoutListConstants.ActionTypes;
var CHANGE_EVENT = 'change';



class _HangoutStore {
    constructor() {
        this.hangouts = {};
    }

    getAll() {
        var hangouts =  (_.values(this.hangouts) || []);
        return _.sortBy(hangouts, function(h) {
            return h.start_time;
        }).reverse();
//        return this.hangouts;
    }

    get(id) {
        return this.hangouts[id];
    }
}

MicroEvent.mixin(_HangoutStore);

var HangoutStore = new _HangoutStore();


function _replaceHangout(hangout) {
    if (_.has(HangoutStore.hangouts, hangout.hangout_id)) {
        HangoutStore.hangouts[hangout.hangout_id] = hangout;
    }
}

function _addHangout(hangout) {
    if (!_.has(HangoutStore.hangouts, hangout.hangout_id)) {
        HangoutStore.hangouts[hangout.hangout_id] = hangout;
    }
}

function _addHangouts(hangouts) {
    _.each(hangouts, function(hangout) {
        _addHangout(hangout);
    });
}

function _changeHangoutActive(hangout_id, active) {
    if (_.has(HangoutStore.hangouts, hangout_id)) {
        HangoutStore.hangouts[hangout_id].active = active;
    }
}



AppDispatcher.register(function(payload) {
    switch( payload.type ) {
        case ActionTypes.RECEIVE_ALL_HANGOUTS:
            _addHangouts(payload.hangouts);
            HangoutStore.trigger(CHANGE_EVENT);
            break;
        case ActionTypes.RECEIVE_NEW_HANGOUT:
            _addHangout(payload.hangout);
            HangoutStore.trigger(CHANGE_EVENT);
            break;
        case ActionTypes.RECEIVE_CHANGED_HANGOUT:
            _replaceHangout(payload.hangout);
            HangoutStore.trigger(CHANGE_EVENT);
            break;
        case ActionTypes.UPDATE_HANGOUT_ACTIVE:
            _changeHangoutActive(payload.hangout_id, payload.active);
            /* hangoutStore.trigger(CHANGE_EVENT); */
            break;
        default:
    }
    
    return true;
});

exports.HangoutStore = HangoutStore;
