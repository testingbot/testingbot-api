'use strict';

const assert = require('assert');
const path = require('path');
const { newClient } = require('../support/client');

describe('File Storage', function () {
  beforeEach(function () {
    this.api = newClient();
  });

  it('should upload a local file', function (done) {
    const testFilePath = path.resolve(__dirname, '..', 'test.apk');
    this.api.uploadFile(testFilePath, function (err, response) {
      assert.strictEqual(err, null, 'Should not have an error uploading file');
      assert.ok(response, 'Response should exist');
      assert.ok(response.app_url, 'App URL should be returned');
      assert.strictEqual(typeof (response.app_url), 'string', 'App URL should be a string');
      done();
    });
  });

  it('should upload a remote file', function (done) {
    this.api.uploadRemoteFile('https://testingbot.com/appium/sample.apk', function (err, response) {
      assert.strictEqual(err, null, 'Should not have an error uploading remote file');
      assert.ok(response, 'Response should exist');
      assert.ok(response.app_url, 'App URL should be returned');
      assert.strictEqual(typeof (response.app_url), 'string', 'App URL should be a string');
      done();
    });
  });

  it('should list storage files', function (done) {
    this.api.getStorageFiles(undefined, undefined, function (err, response) {
      assert.strictEqual(err, null, 'Should not have an error');
      assert.ok(response, 'Response should exist');
      assert.ok(Array.isArray(response.data) || Array.isArray(response), 'Response should contain an array');
      done();
    });
  });

  it('should list storage files with pagination', function (done) {
    this.api.getStorageFiles(0, 5, function (err, response) {
      assert.strictEqual(err, null, 'Should not have an error');
      assert.ok(response, 'Response should exist');
      done();
    });
  });

  it('should get a specific storage file', function (done) {
    this.api.getStorageFiles(undefined, undefined, (err, response) => {
      const files = response.data || response;
      if (files && files.length > 0) {
        let appUrl = files[0].app_url || files[0].url;
        if (appUrl) {
          appUrl = appUrl.replace('tb://', '');
          this.api.getStorageFile(appUrl, (err, fileResponse) => {
            assert.strictEqual(err, null, 'Should not have an error getting storage file');
            assert.ok(fileResponse, 'File response should exist');
            done();
          });
        } else {
          done();
        }
      } else {
        done();
      }
    });
  });

  it('should delete a storage file', function (done) {
    this.api.uploadRemoteFile('https://testingbot.com/appium/sample.apk', (err, response) => {
      if (response && response.app_url) {
        const appUrl = response.app_url.replace('tb://', '');
        this.api.deleteStorageFile(appUrl, (err, deleteResponse) => {
          assert.strictEqual(err, null, 'Should not have an error deleting storage file');
          done();
        });
      } else {
        done();
      }
    });
  });
});
