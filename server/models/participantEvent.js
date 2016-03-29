var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ParticipantEventSchema = new Schema({
    participants: [{type: mongoose.Schema.Types.ObjectId, ref: 'Participant'}],
    meeting: {type: mongoose.Schema.Types.ObjectId, ref: 'Meeting'},
    timestamp: Date
});

var Model = mongoose.model('ParticipantEvent', ParticipantEventSchema);

module.exports = Model;
