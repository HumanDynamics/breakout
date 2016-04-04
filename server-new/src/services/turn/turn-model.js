'use strict'

// turn-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const turnSchema = new Schema({
  meeting: {type: String, ref: 'Meeting'},
  participant: {type: String, ref: 'Participant'},
  from: Date,
  to: Date,
  data: {
    participant: {type: mongoose.Schema.Types.ObjectId, ref: 'Participant'},
    turns: Number
  }
})

const turnModel = mongoose.model('turn', turnSchema)

module.exports = turnModel
