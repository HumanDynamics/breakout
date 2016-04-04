'use strict'

const service = require('feathers-mongoose')
const utteranceDistribution = require('./utteranceDistribution-model')
const hooks = require('./hooks')
const globalFilters = require('../../filters')

module.exports = function () {
  const app = this

  const options = {
    Model: utteranceDistribution,
    paginate: {
      default: 5,
      max: 25
    }
  }

  // Initialize our service with any options it requires
  app.use('/utteranceDistributions', service(options))

  // Get our initialize service to that we can bind hooks
  const utteranceDistributionService = app.service('/utteranceDistributions')

  // Set up our before hooks
  utteranceDistributionService.before(hooks.before)

  // Set up our after hooks
  utteranceDistributionService.after(hooks.after)

  utteranceDistributionService.filter(globalFilters.encryptParticipantFilter)
}
