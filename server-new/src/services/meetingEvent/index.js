'use strict'

const service = require('feathers-mongoose')
const meetingEvent = require('./meetingEvent-model')
const hooks = require('./hooks')
const globalFilters = require('../../filters')

module.exports = function () {
  const app = this

  const options = {
    Model: meetingEvent,
    paginate: {
      default: 5,
      max: 25
    }
  }

  // Initialize our service with any options it requires
  app.use('/meetingEvents', service(options))

  // Get our initialize service to that we can bind hooks
  const meetingEventService = app.service('/meetingEvents')

  // Set up our before hooks
  meetingEventService.before(hooks.before)

  // Set up our after hooks
  meetingEventService.after(hooks.after)
 
  meetingEventService.filter(globalFilters.encryptParticipantFilter)
}
