'use strict'

const globalHooks = require('../../../hooks')

exports.before = {
  all: [globalHooks.encryptHook(['_id', 'name'])],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
}

exports.after = {
  all: [globalHooks.encryptHook(['_id', 'name'])],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
}
