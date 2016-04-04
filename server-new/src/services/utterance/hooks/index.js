'use strict'

const globalHooks = require('../../../hooks')
const repeatHook = require('./repeatHook').hook

exports.before = {
  all: [globalHooks.encryptHook(['participant'])],
  find: [],
  get: [],
  create: [repeatHook],
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
