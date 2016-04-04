'use strict'

// participantEvent-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const participantEventSchema = new Schema({
  participants: [{type: String, ref: 'Participant'}],
  meeting: {type: String, ref: 'Meeting'},
  timestamp: Date
})

const participantEventModel = mongoose.model('participantEvent', participantEventSchema)

module.exports = participantEventModel
