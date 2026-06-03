'use strict';

const assert = require('assert');
const { newClient } = require('../support/client');

describe('Screenshot Service', function () {
  beforeEach(function () {
    this.api = newClient();
  });

  it('should take a screenshot', function (done) {
    this.api.takeScreenshot('https://testingbot.com', [{ browserName: 'chrome', version: 134, os: 'WIN10' }], '1280x1024', 0, undefined, undefined, function (err, response) {
      assert.strictEqual(err, null, 'Should not have an error taking screenshot');
      assert.ok(response, 'Response should exist');
      assert.ok(response.screenshot_id || response.id, 'Screenshot ID should be returned');
      done();
    });
  });

  it('should retrieve screenshot details', function (done) {
    this.api.takeScreenshot('https://testingbot.com', [{ browserName: 'chrome', version: 134, os: 'WIN10' }], '1280x1024', undefined, undefined, undefined, (err, response) => {
      if (response && (response.screenshot_id || response.id)) {
        const screenshotId = response.screenshot_id || response.id;
        setTimeout(() => {
          this.api.retrieveScreenshots(screenshotId, (err, screenshotResponse) => {
            assert.strictEqual(err, null, 'Should not have an error retrieving screenshot');
            assert.ok(screenshotResponse, 'Screenshot response should exist');
            done();
          });
        }, 2000);
      } else {
        done();
      }
    });
  });

  it('should list screenshots', function (done) {
    this.api.getScreenshotList(undefined, undefined, function (err, response) {
      assert.strictEqual(err, null, 'Should not have an error');
      assert.ok(response, 'Response should exist');
      assert.ok(Array.isArray(response.data) || Array.isArray(response), 'Response should contain an array');
      done();
    });
  });

  it('should list screenshots with pagination', function (done) {
    this.api.getScreenshotList(0, 5, function (err, response) {
      assert.strictEqual(err, null, 'Should not have an error');
      assert.ok(response, 'Response should exist');
      done();
    });
  });
});
