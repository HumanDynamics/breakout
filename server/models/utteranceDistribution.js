var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UtteranceDistributionSchema = new Schema({
    meeting: {type: mongoose.Schema.Types.ObjectId, ref: 'Meeting'},
    talkTimes: [{
        participant: {type: mongoose.Schema.Types.ObjectId, ref: 'Participant'},
        seconds: Number
    }],
    timestamp: Date
});

var Model = mongoose.model('UtteranceDistribution', UtteranceDistributionSchema);

module.exports = Model;
