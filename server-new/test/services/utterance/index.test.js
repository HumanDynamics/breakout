'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('utterance service', () => {
  it('registered the utterances service', () => {
    assert.ok(app.service('utterances'));
  });
});
