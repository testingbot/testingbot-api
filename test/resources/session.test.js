'use strict';

const assert = require('assert');
const { newClient } = require('../support/client');

describe('Session Management', function () {
  this.timeout(10000);

  beforeEach(function () {
    this.api = newClient();
  });

  it('should create a session with custom capabilities', function (done) {
    const customCapabilities = {
      browserName: 'chrome',
      browserVersion: 'latest',
      platform: 'LINUX'
    };
    this.api.createSession({ capabilities: customCapabilities }, function (err, response) {
      assert.strictEqual(err, null, 'Should not have an error creating session');
      assert.ok(response, 'Response should exist');
      done();
    });
  });

  it('should handle session creation errors gracefully', function (done) {
    const api = newClient({ api_key: 'invalid_key', api_secret: 'invalid_secret' });
    api.createSession({}, function (err, response) {
      assert.notStrictEqual(err, null, 'Should have an error for invalid credentials');
      assert.strictEqual(response, null, 'Response should be null for invalid credentials');
      done();
    });
  });
});
