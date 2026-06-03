'use strict';

const assert = require('assert');
const { newClient } = require('../support/client');

describe('Tunnel Management', function () {
  beforeEach(function () {
    this.api = newClient();
  });

  it('should get tunnel information', function (done) {
    this.api.getTunnel(function (err, response) {
      assert.strictEqual(err, null, 'Should not have an error');
      assert.ok(response, 'Response should exist');
      done();
    });
  });

  it('should list tunnels', function (done) {
    this.api.getTunnelList(function (err, response) {
      assert.strictEqual(err, null, 'Should not have an error');
      assert.ok(response, 'Response should exist');
      assert.ok(Array.isArray(response) || (response && Array.isArray(response.data)), 'Response should contain an array');
      done();
    });
  });

  it('should delete a tunnel', function (done) {
    this.api.getTunnelList((err, response) => {
      const tunnels = response || response.data || [];
      if (Array.isArray(tunnels) && tunnels.length > 0) {
        const tunnelId = tunnels[0].id || tunnels[0].tunnel_id;
        this.api.deleteTunnel(tunnelId, (err, deleteResponse) => {
          assert.strictEqual(err, null, 'Should not have an error deleting tunnel');
          done();
        });
      } else {
        done();
      }
    });
  });
});
