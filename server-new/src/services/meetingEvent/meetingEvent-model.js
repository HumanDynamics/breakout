'use strict'

// meetingEvent-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const meetingEventSchema = new Schema({
  meeting: {type: String, ref: 'Meeting'},
  event: {
    type: String,
    enum: ['end', 'start']
  },
  timestamp: Date
})

const meetingEventModel = mongoose.model('meetingEvent', meetingEventSchema)

module.exports = meetingEventModel
