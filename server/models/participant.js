var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ParticipantSchema = new Schema({
    _id: String,
    name: String,
    meeting: {type: mongoose.Schema.Types.ObjectId, ref: 'Meeting'},
    consent: Boolean,
    consentDate: Date
});

ParticipantSchema.virtual('participantId').get(
    function () {
        return this._id;
    });

var Model = mongoose.model('Participant', ParticipantSchema);

module.exports = Model;
