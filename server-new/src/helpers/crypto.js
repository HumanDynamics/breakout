'use strict'

// crypto.js - some simple cryptography tools

const fs = require('fs')
const crypto = require('crypto')

const algorithm = 'aes-256-ctr'
var password = null

fs.readFile('./config/key.txt', 'utf8', function (err, data) {
  if (err) {
    console.log(err)
  }
  password = data
})

// Nodejs encryption with CTR

function encrypt (text) {
  var cipher = crypto.createCipher(algorithm, password)
  var crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex')
  return crypted
}

function decrypt (text) {
  var decipher = crypto.createDecipher(algorithm, password)
  var dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8')
  return dec
}

module.exports = {
  encrypt: encrypt,
  decrypt: decrypt
}
