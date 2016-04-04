'use strict'

const service = require('feathers-mongoose')
const participant = require('./participant-model')
const hooks = require('./hooks')
const globalFilters = require('../../filters')

module.exports = function () {
  const app = this

  const options = {
    Model: participant,
    paginate: {
      default: 5,
      max: 25
    }
  }

  // Initialize our service with any options it requires
  app.use('/participants', service(options))

  // Get our initialize service to that we can bind hooks
  const participantService = app.service('/participants')

  // Set up our before hooks
  participantService.before(hooks.before)

  // Set up our after hooks
  participantService.after(hooks.after)

  participantService.filter(globalFilters.encryptParticipantFilter)
}
