'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('turn service', () => {
  it('registered the turns service', () => {
    assert.ok(app.service('turns'));
  });
});
