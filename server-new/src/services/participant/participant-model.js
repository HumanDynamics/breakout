'use strict'

// participant-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const participantSchema = new Schema({
  _id: String,
  name: String,
  meeting: {type: String, ref: 'meeting'},
  consent: Boolean,
  consentDate: Date,
  createdAt: { type: Date, 'default': Date.now },
  updatedAt: { type: Date, 'default': Date.now }
})

const participantModel = mongoose.model('participant', participantSchema)

module.exports = participantModel
