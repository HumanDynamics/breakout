import AppDispatcher from '../dispatcher/dispatcher';
import HangoutListConstants from '../constants/HangoutListConstants';

var ActionTypes = HangoutListConstants.ActionTypes;


module.exports = {

    receiveAllHangouts: function(hangouts) {
        console.log("dispatching receiveALlHangouts");
        AppDispatcher.dispatch({
            type: ActionTypes.RECEIVE_ALL_HANGOUTS,
            hangouts: hangouts
        });
    },

    receiveNewHangout: function(hangout) {
        AppDispatcher.dispatch({
            type: ActionTypes.RECEIVE_NEW_HANGOUT,
            hangout: hangout
        });
    },

    receiveChangedHangout: function(hangout) {
        AppDispatcher.dispatch({
            type: ActionTypes.RECEIVE_CHANGED_HANGOUT,
            hangout: hangout
        });
    },
    
    updateHangoutActive: function(hangoutDBId, active) {
        AppDispatcher.dispatch({
            type: ActionTypes.UPDATE_HANGOUT_ACTIVE,
            hangoutDBId: hangoutDBId,
            active: active
        });
    }
};
