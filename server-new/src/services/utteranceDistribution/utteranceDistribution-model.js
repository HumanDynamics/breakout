'use strict'

// utteranceDistribution-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const utteranceDistributionSchema = new Schema({
  meeting: {type: String, ref: 'Meeting'},
  talkTimes: [{
    participant: {type: String, ref: 'Participant'},
    seconds: Number
  }],
  timestamp: Date
})

const utteranceDistributionModel = mongoose.model('utteranceDistribution', utteranceDistributionSchema)

module.exports = utteranceDistributionModel
