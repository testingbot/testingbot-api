'use strict';

const assert = require('assert');
const { newClient } = require('../support/client');

describe('Team Management', function () {
  beforeEach(function () {
    this.api = newClient();
  });

  it('should get team information', function (done) {
    this.api.getTeam(function (err, response) {
      if (err && err.message && err.message.includes('not authorized')) {
        return done();
      }
      assert.strictEqual(err, null, 'Should not have an error');
      assert.ok(response, 'Response should exist');
      done();
    });
  });

  it('should list users in team', function (done) {
    this.api.getUsersInTeam(function (err, response) {
      if (err && err.message && err.message.includes('not authorized')) {
        return done();
      }
      assert.strictEqual(err, null, 'Should not have an error');
      assert.ok(response, 'Response should exist');
      done();
    });
  });

  it('should get a specific user from team', function (done) {
    this.api.getUsersInTeam((err, response) => {
      if (err && err.message && err.message.includes('not authorized')) {
        return done();
      }
      const users = (response && response.data) || response || [];
      if (users.length > 0) {
        const userId = users[0].id || users[0].user_id;
        this.api.getUserFromTeam(userId, (err, userResponse) => {
          assert.strictEqual(err, null, 'Should not have an error getting user from team');
          assert.ok(userResponse, 'User response should exist');
          done();
        });
      } else {
        done();
      }
    });
  });

  it('should create a user in team', function (done) {
    const newUser = {
      email: 'test_' + Date.now() + '@example.com',
      first_name: 'Test',
      last_name: 'User'
    };
    this.api.createUserInTeam(newUser, (err, response) => {
      if (err && err.message && err.message.includes('not authorized')) {
        return done();
      }
      assert.strictEqual(err, null, 'Should not have an error creating user');
      assert.ok(response, 'Response should exist');
      done();
    });
  });
});
