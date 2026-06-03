'use strict';

const assert = require('assert');
const { newClient } = require('./support/client');

// Client-side parameter validation throws synchronously, before any network
// call — so these run without credentials.
describe('Parameter validation', function () {
  beforeEach(function () {
    this.api = newClient();
  });

  it('getDevice requires a device ID', function () {
    assert.throws(() => this.api.getDevice(null, () => {}), /Device ID is required/);
  });

  it('takeScreenshot validates url, browsers and resolution', function () {
    assert.throws(() => this.api.takeScreenshot(), /URL is required/);
    assert.throws(
      () => this.api.takeScreenshot('https://x', [], '1920x1080', null, null, null, () => {}),
      /At least one browser configuration is required/
    );
    assert.throws(
      () => this.api.takeScreenshot('https://x', [{ browserName: 'chrome' }], null, null, null, null, () => {}),
      /Resolution is required/
    );
  });

  it('mutation methods require their identifiers', function () {
    assert.throws(() => this.api.stopTest(null, () => {}), /Test ID is required/);
    assert.throws(() => this.api.deleteTest(null, () => {}), /Test ID is required/);
    assert.throws(() => this.api.deleteTunnel(null, () => {}), /Tunnel ID is required/);
    assert.throws(() => this.api.deleteStorageFile(null, () => {}), /App URL is required/);
    assert.throws(() => this.api.uploadRemoteFile(null, () => {}), /Remote URL is required/);
  });

  it('codeless methods validate their inputs', function () {
    assert.throws(() => this.api.createCodelessTest({ name: 'Test' }, () => {}), /Test name and URL are required/);
    assert.throws(() => this.api.updateCodelessTest({ test: {} }, null, () => {}), /Test ID is required/);
    assert.throws(() => this.api.updateCodelessTest(null, '123', () => {}), /Data is required/);
    assert.throws(() => this.api.deleteCodelessTest(null, () => {}), /Test ID is required/);
  });

  it('does not throw synchronously when the callback is null', function () {
    assert.doesNotThrow(() => {
      const p = this.api.getUserInfo(null);
      if (p && typeof p.catch === 'function') p.catch(() => {});
    });
  });
});
