var MeetingModel = require('./meeting');
var MeetingEventModel = require('./meeting');
var ParticipantModel = require('./participant');
var ParticipantEventModel = require('./participantEvent');
var TurnModel = require('./turn');
var UtteranceModel = require('./utterance');
var UtteranceDistributionModel = require('./utteranceDistribution');

module.exports = {
    meeting: MeetingModel,
    meetingEvent: MeetingEventModel,
    participant: ParticipantModel,
    participantEvent: ParticipantEventModel,
    turn: TurnModel,
    utterance: UtteranceModel,
    utteranceDistribution: UtteranceDistributionModel
}
