var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MeetingSchema = new Schema({
    _id: {type: String},
    participants: [String],
    startTime: Date,
    endTime: Date,
    active: Boolean
});

MeetingSchema.virtual('meetingId').get(function() {
    return this._id;
});

var Model = mongoose.model('Meeting', MeetingSchema);

module.exports = Model;
