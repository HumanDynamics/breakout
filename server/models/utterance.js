var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UtteranceSchema = new Schema({
    participant: {type: mongoose.Schema.Types.ObjectId, ref: 'Participant'},
    meeting: {type: mongoose.Schema.Types.ObjectId, ref: 'Meeting'},
    startTime: Date,
    endTime: Date,
    volumes: [Number]
});

var Model = mongoose.model('Utterance', UtteranceSchema);

module.exports = Model;
