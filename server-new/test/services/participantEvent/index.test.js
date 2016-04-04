'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('participantEvent service', () => {
  it('registered the participantEvents service', () => {
    assert.ok(app.service('participantEvents'));
  });
});
