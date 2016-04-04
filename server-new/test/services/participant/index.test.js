'use strict'

const assert = require('assert')
const app = require('../../../src/app')

describe('participant service', () => {
  it('registered the participants service', () => {
    assert.ok(app.service('participants'))
  })
})
