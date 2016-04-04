var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MeetingEventSchema = new Schema({
    meeting: {type: String, ref: 'Meeting'},
    event: {
        type: String,
        enum: ['end', 'start']
    },
    timestamp: Date
});

var Model = mongoose.model('MeetingEvent', MeetingEventSchema);

module.exports = Model;
