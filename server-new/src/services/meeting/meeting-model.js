'use strict'

// meeting-model.js - model for meetings.
//
// Participants are the collection of participants *currently* in the meeting.

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const meetingSchema = new Schema({
  _id: {type: String},
  participants: [{type: String, ref: 'Participant'}],
  startTime: {type: Date, 'default': Date.now},
  endTime: Date,
  active: Boolean
})

const meetingModel = mongoose.model('meeting', meetingSchema)

module.exports = meetingModel
