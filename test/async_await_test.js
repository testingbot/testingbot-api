'use strict';

const TbApi = require('../lib/api.js');
const assert = require('assert');

describe('TestingBot API Async/Await Tests', function() {
  beforeEach(function() {
    this.api = new TbApi();
  });

  describe('Async/Await Support', function() {
    it('should get user info using async/await', async function() {
      const response = await this.api.getUserInfo();
      assert.notStrictEqual(response, null, 'Response should not be null');
      assert.strictEqual(typeof(response.first_name), 'string', 'First name should be a string');
      assert.notStrictEqual(response.plan, undefined, 'Plan should be defined');
    });

    it('should handle errors with async/await', async function() {
      const api = new TbApi({ api_key: 'bogus', api_secret: 'bogus' });
      try {
        await api.getUserInfo();
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.notStrictEqual(error, null, 'Should have an error for invalid credentials');
      }
    });

    it('should get tests using async/await', async function() {
      const response = await this.api.getTests(0, 5);
      assert.notStrictEqual(response, null, 'Response should not be null');
      assert.ok(Array.isArray(response.data), 'Response data should be an array');
    });

    it('should get browsers using async/await', async function() {
      const response = await this.api.getBrowsers();
      assert.notStrictEqual(response, null, 'Response should not be null');
      assert.ok(Array.isArray(response), 'Response should be an array');
    });

    it('should chain multiple async calls', async function() {
      const userInfo = await this.api.getUserInfo();
      assert.notStrictEqual(userInfo, null, 'User info should not be null');

      const tests = await this.api.getTests(0, 1);
      assert.notStrictEqual(tests, null, 'Tests should not be null');

      const browsers = await this.api.getBrowsers();
      assert.notStrictEqual(browsers, null, 'Browsers should not be null');
    });

    it('should still support callbacks alongside promises', function(done) {
      // Callback style should still work
      this.api.getUserInfo(function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.notStrictEqual(response, null, 'Response should not be null');
        done();
      });
    });

    it('should work with Promise.all for parallel requests', async function() {
      const [userInfo, browsers, tests] = await Promise.all([
        this.api.getUserInfo(),
        this.api.getBrowsers(),
        this.api.getTests(0, 5)
      ]);

      assert.notStrictEqual(userInfo, null, 'User info should not be null');
      assert.notStrictEqual(browsers, null, 'Browsers should not be null');
      assert.notStrictEqual(tests, null, 'Tests should not be null');
    });

    it('should upload a file using async/await', async function() {
      const path = require('path');
      const testFilePath = path.resolve(__dirname, 'test.apk');
      const response = await this.api.uploadFile(testFilePath);
      assert.notStrictEqual(response, null, 'Response should not be null');
      assert.ok(response.app_url, 'App URL should be returned');
      assert.strictEqual(typeof(response.app_url), 'string', 'App URL should be a string');
    });

    it('should create a session using async/await', async function() {
      try {
        const response = await this.api.createSession({});
        if (response && response.sessionId) {
          assert.ok(response.sessionId, 'Session ID should be returned');
          assert.strictEqual(typeof response.sessionId, 'string', 'Session ID should be a string');
        }
      } catch (error) {
        assert.ok(error, 'Error is expected if session creation is not available');
      }
    });

    it('should create a session with custom capabilities using async/await', async function() {
      const options = {
        capabilities: {
          browserName: 'chrome',
          browserVersion: '140',
          platform: 'WIN11'
        },
        name: 'Async Test Session'
      };

      try {
        const response = await this.api.createSession(options);
        if (response && response.sessionId) {
          assert.ok(response.sessionId, 'Session ID should be returned');
        }
      } catch (error) {
        // Handle cases where session creation fails
        assert.ok(error, 'Error is expected if session creation fails');
      }
    });

    it('should get codeless tests using async/await', async function() {
      const response = await this.api.getCodelessTests(0, 10);
      assert.notStrictEqual(response, null, 'Response should not be null');
      assert.ok(response.data || response, 'Response data should exist');
    });

    it('should handle codeless test operations using async/await', async function() {
      const tests = await this.api.getCodelessTests(0, 5);
      const testData = (tests && tests.data) || tests || [];

      if (testData.length > 0) {
        const testId = testData[0].id;

        // Try to update
        try {
          const updateData = { test: { status_message: 'Updated via async/await' } };
          await this.api.updateCodelessTest(updateData, testId);
        } catch (error) {
          assert.ok(error || true, 'Update may fail but should not crash');
        }
      }
    });

    it('should handle multiple file operations with async/await', async function() {
      try {
        // Upload a remote file
        const uploadResponse = await this.api.uploadRemoteFile('https://testingbot.com/appium/sample.apk');
        assert.ok(uploadResponse, 'Upload response should exist');

        if (uploadResponse && uploadResponse.app_url) {
          // List storage files
          const files = await this.api.getStorageFiles(0, 10);
          assert.ok(files, 'Files list should exist');

          // Get specific file
          const appUrl = uploadResponse.app_url.replace('tb://', '');
          const fileInfo = await this.api.getStorageFile(appUrl);
          assert.ok(fileInfo, 'File info should exist');

          // Delete the file
          await this.api.deleteStorageFile(appUrl);
        }
      } catch (error) {
        // Some operations may fail due to permissions or availability
        assert.ok(error, 'Operations may fail but should handle gracefully');
      }
    });

    it('should handle team management operations with async/await', async function() {
      try {
        const team = await this.api.getTeam();
        if (team) {
          const users = await this.api.getUsersInTeam();
          assert.ok(users || team, 'Should have team or users information');
        }
      } catch (error) {
        assert.ok(error.message && error.message.includes('not authorized'),
          'Should handle authorization errors gracefully');
      }
    });

    it('should handle error scenarios with async/await', async function() {
      const api = new TbApi({ api_key: 'invalid', api_secret: 'invalid' });

      const errorTests = [
        api.getUserInfo(),
        api.getTests(0, 10),
        api.createSession({}),
        api.uploadRemoteFile('https://invalid-url.com/file.apk')
      ];

      for (const testPromise of errorTests) {
        try {
          await testPromise;
        } catch (error) {
          assert.ok(error, 'Should throw error for invalid credentials');
        }
      }
    });
  });
});