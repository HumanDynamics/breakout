'use strict'

const service = require('feathers-mongoose')
const meeting = require('./meeting-model')
const hooks = require('./hooks')
const globalFilters = require('../../filters')

module.exports = function () {
  const app = this

  const options = {
    Model: meeting,
    paginate: {
      default: 5,
      max: 25
    }
  }

  app.use('/meetings', service(options))

  const meetingService = app.service('/meetings')
  meetingService.before(hooks.before)
  meetingService.after(hooks.after)
  meetingService.filter(globalFilters.encryptParticipantFilter)
}
