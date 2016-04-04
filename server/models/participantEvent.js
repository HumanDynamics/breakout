var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ParticipantEventSchema = new Schema({
    participants: [{type: String, ref: 'Participant'}],
    meeting: {type: String, ref: 'Meeting'},
    timestamp: Date
});

var Model = mongoose.model('ParticipantEvent', ParticipantEventSchema);

module.exports = Model;
