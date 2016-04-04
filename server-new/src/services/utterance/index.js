'use strict'

const service = require('feathers-mongoose')
const utterance = require('./utterance-model')
const hooks = require('./hooks')
const globalFilters = require('../../filters')

module.exports = function () {
  const app = this

  const options = {
    Model: utterance,
    paginate: {
      default: 5,
      max: 25
    }
  }

  // Initialize our service with any options it requires
  app.use('/utterances', service(options))

  // Get our initialize service to that we can bind hooks
  const utteranceService = app.service('/utterances')

  // Set up our before hooks
  utteranceService.before(hooks.before)

  // Set up our after hooks
  utteranceService.after(hooks.after)

  utteranceService.filter(globalFilters.encryptParticipantFilter)
}
