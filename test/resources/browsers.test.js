'use strict';

const assert = require('assert');
const { newClient } = require('../support/client');

describe('Browser Management', function () {
  beforeEach(function () {
    this.api = newClient();
  });

  it('should list all browsers', function (done) {
    this.api.getBrowsers(undefined, function (err, response) {
      assert.strictEqual(err, null, 'Should not have an error');
      assert.ok(response, 'Response should exist');
      assert.ok(Array.isArray(response), 'Response should be an array');
      done();
    });
  });

  it('should list browsers by type', function (done) {
    this.api.getBrowsers('webdriver', function (err, response) {
      assert.strictEqual(err, null, 'Should not have an error');
      assert.ok(response, 'Response should exist');
      done();
    });
  });
});
