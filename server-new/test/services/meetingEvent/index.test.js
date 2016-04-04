'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('meetingEvent service', () => {
  it('registered the meetingEvents service', () => {
    assert.ok(app.service('meetingEvents'));
  });
});
