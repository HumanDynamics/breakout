' use strict'

// crypto-hooks.js
//
// A collection of feathers hooks to encrypt and decrypt objects in-transit.

const winston = require('winston')
const helpers = require('../helpers')
const crypto = helpers.crypto
const transform_keys = helpers.transform_keys

function encrypt_hook (keys) {
  var encrypt_hook = function (hook) {
    winston.log('debug', '>>> ENCRYPTING:', hook.data)

    function encrypt_ids (data) {
      return transform_keys(data, keys, crypto.encrypt)
    }

    if (hook.data != null) {
      var encrypted_data = encrypt_ids(hook.data)
      hook.data = encrypted_data
    }

    if (hook.params != null) {
      /* winston.log("debug", "encrypting params:", hook.params); */
      var encrypted_params = encrypt_ids(hook.params)
      /* winston.log("debug", "encrypted params:", encrypted_params); */
      hook.params = encrypted_params
    }
    return hook
  }
  return encrypt_hook
}

function decrypt_hook (keys) {
  var decrypt_hook = function (hook) {
    winston.log('debug', '>>>DECRYPTING:', hook.result)
    function decrypt_ids (data) {
      return transform_keys(data, keys, crypto.decrypt)
    }

    if (hook.result !== null && hook.result.length > 0) {
      var decrypted = decrypt_ids(hook.result)
      winston.log('debug', 'decrypted:', decrypted)
      hook.result = decrypted
    }
    return hook
  }
  return decrypt_hook
}

module.exports = {
  decrypt: decrypt_hook,
  encrypt: encrypt_hook
}
