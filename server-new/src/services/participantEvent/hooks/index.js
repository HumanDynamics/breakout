'use strict'

const globalHooks = require('../../../hooks')

exports.before = {
  all: [globalHooks.encryptHook(['participants'])],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
}

exports.after = {
  all: [globalHooks.decryptHook(['participants'])],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
}
