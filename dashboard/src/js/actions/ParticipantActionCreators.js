import AppDispatcher from '../dispatcher/dispatcher';
import ParticipantConstants from '../constants/ParticipantConstants';

var ActionTypes = ParticipantConstants.ActionTypes;


module.exports = {

    receiveAllParticipants: function(participants) {
        console.log("dispatching receiveAllParticipants");
        AppDispatcher.dispatch({
            type: ActionTypes.RECEIVE_ALL_PARTICIPANTS,
            participants: participants
        });
    },

    receiveNewParticipant: function(participant) {
        AppDispatcher.dispatch({
            type: ActionTypes.RECEIVE_NEW_PARTICIPANT,
            participant: participant
        });
    },

    receiveChangedParticipant: function(participant) {
        AppDispatcher.dispatch({
            type: ActionTypes.RECEIVE_CHANGED_PARTICIPANT,
            hangout: participant
        });
    }

};
