'use strict'

const globalHooks = require('../../../hooks')

function addStartTime (hook) {
  hook.data.start_time = new Date()
  return hook
}

function updateTime (hook) {
  hook.data.lastUpdated = new Date()
  return hook
}

exports.before = {
  all: [globalHooks.encryptHook(['participants'])],
  create: [addStartTime],
  update: [updateTime],
  patch: [updateTime]
}

exports.after = {
  all: [globalHooks.decryptHook(['participants'])]
}
