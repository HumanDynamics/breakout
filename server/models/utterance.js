var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UtteranceSchema = new Schema({
    participant: {type: String, ref: 'Participant'},
    meeting: {type: String, ref: 'Meeting'},
    startTime: Date,
    endTime: Date,
    volumes: [Number]
});

var Model = mongoose.model('Utterance', UtteranceSchema);

module.exports = Model;
