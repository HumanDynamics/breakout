'use strict'

// Add any common hooks you want to share across services in here.
//
// Below is an example of how a hook is written and exported. Please
// see http://docs.feathersjs.com/hooks/readme.html for more details
// on hooks.

const cryptoHooks = require('./crypto-hooks')

module.exports = {
  encryptHook: cryptoHooks.encrypt,
  decryptHook: cryptoHooks.decrypt
}

