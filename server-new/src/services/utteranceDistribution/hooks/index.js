'use strict'

const globalHooks = require('../../../hooks')

exports.before = {
  all: [globalHooks.encryptHook(['participant'])],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
}

exports.after = {
  all: [globalHooks.decryptHook(['participant'])],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
}
