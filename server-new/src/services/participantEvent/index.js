'use strict'

const service = require('feathers-mongoose')
const participantEvent = require('./participantEvent-model')
const hooks = require('./hooks')
const globalFilters = require('../../filters')

module.exports = function () {
  const app = this

  const options = {
    Model: participantEvent,
    paginate: {
      default: 5,
      max: 25
    }
  }

  // Initialize our service with any options it requires
  app.use('/participantEvents', service(options))

  // Get our initialize service to that we can bind hooks
  const participantEventService = app.service('/participantEvents')

  // Set up our before hooks
  participantEventService.before(hooks.before)

  // Set up our after hooks
  participantEventService.after(hooks.after)
  
  participantEventService.filter(globalFilters.encryptParticipantFilter)
}
