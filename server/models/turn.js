var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TurnsSchema = new Schema({
    meeting: {type: mongoose.Schema.Types.ObjectId, ref: 'Meeting'},
    participant: {type: mongoose.Schema.Types.ObjectId, ref: 'Participant'},
    from: Date,
    to: Date,
    data: {
        participant: {type: mongoose.Schema.Types.ObjectId, ref: 'Participant'},
        turns: Number
    }
});

var Model = mongoose.model('Turns', TurnsSchema);

module.exports = Model;
