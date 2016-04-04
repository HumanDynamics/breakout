var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ParticipantSchema = new Schema({
    _id: String,
    name: String,
    meeting: {type: String, ref: 'Meeting'},
    consent: Boolean,
    consentDate: Date,
});

ParticipantSchema.virtual('participant_id').get(
    function () {
        return this._id;
    });

var Model = mongoose.model('Participant', ParticipantSchema);

module.exports = Model;
