'use strict';

const assert = require('assert');
const { newClient } = require('../support/client');

describe('Device Management', function () {
  beforeEach(function () {
    this.api = newClient();
  });

  it('should list all devices', function (done) {
    this.api.getDevices(function (err, response) {
      assert.strictEqual(err, null, 'Should not have an error');
      assert.ok(response, 'Response should exist');
      assert.ok(Array.isArray(response), 'Response should be an array');
      assert.ok(response.length > 0, 'Should have devices');
      done();
    });
  });

  it('should list available devices', function (done) {
    this.api.getAvailableDevices(function (err, response) {
      assert.strictEqual(err, null, 'Should not have an error');
      assert.ok(response, 'Response should exist');
      assert.ok(Array.isArray(response), 'Response should be an array');
      done();
    });
  });

  it('should get a specific device', function (done) {
    this.api.getDevices((err, response) => {
      if (response && response.length > 0) {
        const deviceId = response[0].id || response[0].device_id;
        this.api.getDevice(deviceId, (err, deviceResponse) => {
          assert.strictEqual(err, null, 'Should not have an error getting device');
          assert.ok(deviceResponse, 'Device response should exist');
          done();
        });
      } else {
        done();
      }
    });
  });
});
