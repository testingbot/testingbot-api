'use strict';

const assert = require('assert');
const { newClient } = require('../support/client');

describe('Authentication', function () {
  beforeEach(function () {
    this.api = newClient();
  });

  it('should get the userinfo for the current user', function (done) {
    this.api.getUserInfo(function (err, response) {
      assert.strictEqual(err, null, 'Should not have an error');
      assert.notStrictEqual(response, null, 'Response should not be null');
      assert.strictEqual(typeof (response.first_name), 'string', 'First name should be a string');
      assert.notStrictEqual(response.plan, undefined, 'Plan should be defined');
      done();
    });
  });

  it('should detect wrong credentials', function (done) {
    const api = newClient({ api_key: 'bogus', api_secret: 'bogus' });
    api.getUserInfo(function (err, response) {
      assert.strictEqual(response, null, 'Response should be null for invalid credentials');
      assert.notStrictEqual(err, null, 'Should have an error for invalid credentials');
      done();
    });
  });

  it('should generate correct authentication hash for sharing', function (done) {
    const hash = this.api.getAuthenticationHashForSharing('sampleSessionId');
    assert.strictEqual(typeof (hash), 'string', 'Hash should be a string');
    assert.strictEqual(hash.length, 32, 'MD5 hash should be 32 characters');
    done();
  });
});

describe('User Management', function () {
  beforeEach(function () {
    this.api = newClient();
  });

  it('should update a user object', function (done) {
    const newName = 'name_' + Math.round(Math.random() * 10000);
    this.api.updateUserInfo({ user: { first_name: newName } }, (err, response) => {
      assert.strictEqual(err, null, 'Should not have an error updating user');
      this.api.getUserInfo((err, response) => {
        assert.notStrictEqual(response, null, 'Response should not be null');
        assert.strictEqual(err, null, 'Should not have an error getting user info');
        assert.strictEqual(response.first_name, newName, 'First name should be updated');
        done();
      });
    });
  });
});
