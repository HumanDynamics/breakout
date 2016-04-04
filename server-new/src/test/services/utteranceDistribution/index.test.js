'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('utteranceDistribution service', () => {
  it('registered the utteranceDistributions service', () => {
    assert.ok(app.service('utteranceDistributions'));
  });
});
