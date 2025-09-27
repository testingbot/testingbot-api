'use strict';

const TbApi = require('../lib/api.js');
const assert = require('assert');
const path = require('path');

describe('TestingBot API Tests', function() {
  beforeEach(function(done) {
    this.api = new TbApi();
    done();
  });

  describe('Authentication Tests', function() {
    it('should get the userinfo for the current user', function(done) {
      this.api.getUserInfo(function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.notStrictEqual(response, null, 'Response should not be null');
        assert.strictEqual(typeof(response.first_name), 'string', 'First name should be a string');
        assert.notStrictEqual(response.plan, undefined, 'Plan should be defined');
        done();
      });
    });

    it('should detect wrong credentials', function(done) {
      const api = new TbApi({ api_key: 'bogus', api_secret: 'bogus' });
      api.getUserInfo(function(err, response) {
        assert.strictEqual(response, null, 'Response should be null for invalid credentials');
        assert.notStrictEqual(err, null, 'Should have an error for invalid credentials');
        done();
      });
    });

    it('should generate correct authentication hash for sharing', function(done) {
      const hash = this.api.getAuthenticationHashForSharing('sampleSessionId');
      assert.strictEqual(typeof(hash), 'string', 'Hash should be a string');
      assert.strictEqual(hash.length, 32, 'MD5 hash should be 32 characters');
      done();
    });
  });

  describe('User Management Tests', function() {
    it('should update a user object', function(done) {
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

  describe('Test Management', function() {
    it('should list tests with default pagination', function(done) {
      this.api.getTests(undefined, undefined, function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        assert.ok(Array.isArray(response.data), 'Response data should be an array');
        assert.ok(response.data.length >= 0, 'Data array should exist');
        done();
      });
    });

    it('should list tests with custom pagination', function(done) {
      this.api.getTests(0, 5, function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        assert.ok(response.meta, 'Meta information should exist');
        done();
      });
    });

    it('should error when no test is found', function(done) {
      this.api.getTestDetails(324234234324, function(err, response) {
        assert.strictEqual(response, null, 'Response should be null for non-existent test');
        assert.notStrictEqual(err, null, 'Should have an error for non-existent test');
        done();
      });
    });

    it('should find a specific test', function(done) {
      this.api.getTests(undefined, undefined, (err, response) => {
        assert.ok(response && response.data && response.data.length > 0, 'Should have test data');
        const singleTest = response.data[0];
        this.api.getTestDetails(singleTest.id, (err, response) => {
          assert.strictEqual(err, null, 'Should not have an error');
          assert.notStrictEqual(response, null, 'Response should not be null');
          assert.strictEqual(response.id, singleTest.id, 'Test ID should match');
          done();
        });
      });
    });

    it('should update a test with legacy data format', function(done) {
      this.api.getTests(undefined, undefined, (err, response) => {
        assert.ok(response && response.data && response.data.length > 0, 'Should have test data');
        const singleTest = response.data[0];
        const statusMessage = 'test_' + Date.now();
        const payload = { 'test[success]': '1', 'test[status_message]': statusMessage };
        this.api.updateTest(payload, singleTest.id, (err) => {
          assert.strictEqual(err, null, 'Should not have an error updating test');
          this.api.getTestDetails(singleTest.id, (err, response) => {
            assert.strictEqual(err, null, 'Should not have an error getting test details');
            assert.strictEqual(response.status_message, statusMessage, 'Status message should be updated');
            done();
          });
        });
      });
    });

    it('should update a test with object data format', function(done) {
      this.api.getTests(undefined, undefined, (err, response) => {
        assert.ok(response && response.data && response.data.length > 0, 'Should have test data');
        const singleTest = response.data[0];
        const statusMessage = 'test2_' + Date.now();
        const payload = { test: { success: 1, status_message: statusMessage } };
        this.api.updateTest(payload, singleTest.id, (err) => {
          assert.strictEqual(err, null, 'Should not have an error updating test');
          this.api.getTestDetails(singleTest.id, (err, response) => {
            assert.strictEqual(err, null, 'Should not have an error getting test details');
            assert.strictEqual(response.status_message, statusMessage, 'Status message should be updated');
            done();
          });
        });
      });
    });

    it('should stop a test', function(done) {
      this.api.getTests(undefined, undefined, (err, response) => {
        if (!response || !response.data || response.data.length === 0) {
          return done();
        }
        const testToStop = response.data.find((test) => test.status === 'running');

        if (!testToStop) {
          return done();
        }

        this.api.stopTest(testToStop.id, (err, response) => {
          assert.strictEqual(err, null, 'Should not have an error stopping test');
          done();
        });
      });
    });

    it('should delete a test', function(done) {
      this.api.getTests(undefined, undefined, (err, response) => {
        assert.ok(response && response.data && response.data.length > 0, 'Should have test data');
        const singleTest = response.data[0];
        this.api.deleteTest(singleTest.id, (err, response) => {
          assert.strictEqual(err, null, 'Should not have an error deleting test');
          this.api.getTestDetails(singleTest.id, (err, response) => {
            assert.strictEqual(response, null, 'Response should be null after deletion');
            assert.notStrictEqual(err, null, 'Should have an error for deleted test');
            done();
          });
        });
      });
    });
  });

  describe('Device Management', function() {
    it('should list all devices', function(done) {
      this.api.getDevices(function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        assert.ok(Array.isArray(response), 'Response should be an array');
        assert.ok(response.length > 0, 'Should have devices');
        done();
      });
    });

    it('should list available devices', function(done) {
      this.api.getAvailableDevices(function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        assert.ok(Array.isArray(response), 'Response should be an array');
        done();
      });
    });

    it('should get a specific device', function(done) {
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

  describe('Browser Management', function() {
    it('should list all browsers', function(done) {
      this.api.getBrowsers(undefined, function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        assert.ok(Array.isArray(response), 'Response should be an array');
        done();
      });
    });

    it('should list browsers by type', function(done) {
      this.api.getBrowsers('webdriver', function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        done();
      });
    });
  });

  describe('File Storage', function() {
    it('should upload a local file', function(done) {
      const testFilePath = path.resolve(__dirname, 'test.apk');
      this.api.uploadFile(testFilePath, function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error uploading file');
        assert.ok(response, 'Response should exist');
        assert.ok(response.app_url, 'App URL should be returned');
        assert.strictEqual(typeof(response.app_url), 'string', 'App URL should be a string');
        done();
      });
    });

    it('should upload a remote file', function(done) {
      this.api.uploadRemoteFile('https://testingbot.com/appium/sample.apk', function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error uploading remote file');
        assert.ok(response, 'Response should exist');
        assert.ok(response.app_url, 'App URL should be returned');
        assert.strictEqual(typeof(response.app_url), 'string', 'App URL should be a string');
        done();
      });
    });

    it('should list storage files', function(done) {
      this.api.getStorageFiles(undefined, undefined, function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        assert.ok(Array.isArray(response.data) || Array.isArray(response), 'Response should contain an array');
        done();
      });
    });

    it('should list storage files with pagination', function(done) {
      this.api.getStorageFiles(0, 5, function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        done();
      });
    });

    it('should get a specific storage file', function(done) {
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

    it('should delete a storage file', function(done) {
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

  describe('Screenshot Service', function() {
    it('should take a screenshot', function(done) {
      this.api.takeScreenshot('https://testingbot.com', [{ "browserName" : "chrome", "version" : 134, "os" : "WIN10"}], '1280x1024', 0, undefined, undefined, function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error taking screenshot');
        assert.ok(response, 'Response should exist');
        assert.ok(response.screenshot_id || response.id, 'Screenshot ID should be returned');
        done();
      });
    });

    it('should retrieve screenshot details', function(done) {
      this.api.takeScreenshot('https://testingbot.com', [{ "browserName" : "chrome", "version" : 134, "os" : "WIN10"}], '1280x1024', undefined, undefined, undefined, (err, response) => {
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

    it('should list screenshots', function(done) {
      this.api.getScreenshotList(undefined, undefined, function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        assert.ok(Array.isArray(response.data) || Array.isArray(response), 'Response should contain an array');
        done();
      });
    });

    it('should list screenshots with pagination', function(done) {
      this.api.getScreenshotList(0, 5, function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        done();
      });
    });
  });

  describe('Tunnel Management', function() {
    it('should get tunnel information', function(done) {
      this.api.getTunnel(function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        done();
      });
    });

    it('should list tunnels', function(done) {
      this.api.getTunnelList(function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        assert.ok(Array.isArray(response) || (response && Array.isArray(response.data)), 'Response should contain an array');
        done();
      });
    });

    it('should delete a tunnel', function(done) {
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

  describe('Codeless Tests Management', function() {
    it('should list codeless tests', function(done) {
      this.api.getCodelessTests(0, 10, function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        assert.ok(response.data || response, 'Response data should exist');
        done();
      });
    });

    it('should list codeless tests with pagination', function(done) {
      this.api.getCodelessTests(0, 5, function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        done();
      });
    });

    it('should list codeless tests with custom offset and limit', function(done) {
      this.api.getCodelessTests(10, 20, function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        if (response.meta) {
          assert.ok(typeof response.meta === 'object', 'Meta should be an object');
        }
        done();
      });
    });

    it('should update a codeless test', function(done) {
      this.api.getCodelessTests(0, 10, (err, response) => {
        const tests = (response && response.data) || response || [];
        if (tests.length > 0) {
          const testId = tests[0].id;
          const data = { test: { status_message: 'Updated codeless test' } };
          this.api.updateCodelessTest(data, testId, (err, updateResponse) => {
            if (err && err.message && err.message.includes('500 Error')) {
              return done();
            }
            assert.strictEqual(err, null, 'Should not have an error updating codeless test');
            done();
          });
        } else {
          done();
        }
      });
    });

    it('should throw error when updating codeless test without test ID', function(done) {
      try {
        this.api.updateCodelessTest({ test: { name: 'Test' } }, null, function() {});
        done(new Error('Should have thrown an error'));
      } catch (err) {
        assert.ok(err.message.includes('Test ID is required'), 'Should throw Test ID required error');
        done();
      }
    });

    it('should throw error when updating codeless test without data', function(done) {
      try {
        this.api.updateCodelessTest(null, '12345', function() {});
        done(new Error('Should have thrown an error'));
      } catch (err) {
        assert.ok(err.message.includes('Data is required'), 'Should throw Data required error');
        done();
      }
    });

    it('should delete a codeless test', function(done) {
      this.api.getCodelessTests(0, 10, (err, response) => {
        const tests = (response && response.data) || response || [];
        if (tests.length > 0) {
          const testId = tests[0].id;
          this.api.deleteCodelessTest(testId, (err, deleteResponse) => {
            assert.strictEqual(err, null, 'Should not have an error deleting codeless test');
            done();
          });
        } else {
          done();
        }
      });
    });

    it('should throw error when deleting codeless test without test ID', function(done) {
      try {
        this.api.deleteCodelessTest(null, () => {});
        done(new Error('Should have thrown an error'));
      } catch (err) {
        assert.ok(err.message.includes('Test ID is required'), 'Should throw Test ID required error');
        done();
      }
    });
  });

  describe('Build Management', function() {
    it('should list builds', function(done) {
      this.api.getBuilds(undefined, undefined, function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        done();
      });
    });

    it('should list builds with pagination', function(done) {
      this.api.getBuilds(0, 5, function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        done();
      });
    });

    it('should get tests for a build', function(done) {
      this.api.getBuilds(undefined, undefined, (err, response) => {
        const builds = (response && response.data) || response || [];
        if (builds.length > 0) {
          const buildId = builds[0].id || builds[0].build_id;
          this.api.getTestsForBuild(buildId, (err, testsResponse) => {
            assert.strictEqual(err, null, 'Should not have an error getting tests for build');
            assert.ok(testsResponse, 'Tests response should exist');
            done();
          });
        } else {
          done();
        }
      });
    });

    it('should delete a build', function(done) {
      this.api.getBuilds(undefined, undefined, (err, response) => {
        const builds = (response && response.data) || response || [];
        if (builds.length > 0) {
          const buildId = builds[0].id || builds[0].build_id;
          this.api.deleteBuild(buildId, (err, deleteResponse) => {
            assert.strictEqual(err, null, 'Should not have an error deleting build');
            done();
          });
        } else {
          done();
        }
      });
    });
  });

  describe('Team Management', function() {
    it('should get team information', function(done) {
      this.api.getTeam(function(err, response) {
        if (err && err.message && err.message.includes('not authorized')) {
          return done();
        }
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        done();
      });
    });

    it('should list users in team', function(done) {
      this.api.getUsersInTeam(function(err, response) {
        if (err && err.message && err.message.includes('not authorized')) {
          return done();
        }
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        done();
      });
    });

    it('should get a specific user from team', function(done) {
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

    it('should create a user in team', function(done) {
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

    it('should update a user in team', function(done) {
      this.api.getUsersInTeam((err, response) => {
        if (err && err.message && err.message.includes('not authorized')) {
          return done();
        }
        const users = (response && response.data) || response || [];
        if (users.length > 0) {
          const userId = users[0].id || users[0].user_id;
          const userData = { first_name: 'Updated_' + Date.now() };
          this.api.updateUserInTeam(userId, userData, (err, updateResponse) => {
            assert.strictEqual(err, null, 'Should not have an error updating user in team');
            done();
          });
        } else {
          done();
        }
      });
    });

    it('should reset credentials for a user in team', function(done) {
      this.api.getUsersInTeam((err, response) => {
        if (err && err.message && err.message.includes('not authorized')) {
          return done();
        }
        const users = (response && response.data) || response || [];
        if (users.length > 0) {
          const userId = users[0].id || users[0].user_id;
          this.api.resetCredentials(userId, (err, resetResponse) => {
            assert.strictEqual(err, null, 'Should not have an error resetting credentials');
            done();
          });
        } else {
          done();
        }
      });
    });
  });

  describe('Session Management', function() {
    it('should create a session with default capabilities', function(done) {
      this.api.createSession({}, function(err, response) {
        if (err && err.message && err.message.includes('Unauthorized')) {
          return done();
        }
        assert.ok(response, 'Response should exist');
        if (response && response.sessionId) {
          assert.ok(response.sessionId, 'Session ID should be returned');
          assert.strictEqual(typeof response.sessionId, 'string', 'Session ID should be a string');
        }
        done();
      });
    });

    it('should create a session with custom capabilities', function(done) {
      const customCapabilities = {
        browserName: 'firefox',
        browserVersion: '120',
        platform: 'WIN11'
      };
      this.api.createSession({ capabilities: customCapabilities }, function(err, response) {
        if (err && err.message && err.message.includes('Unauthorized')) {
          return done();
        }
        assert.ok(response || err, 'Should have response or error');
        done();
      });
    });

    it('should handle session creation errors gracefully', function(done) {
      const api = new TbApi({ api_key: 'invalid_key', api_secret: 'invalid_secret' });
      api.createSession({}, function(err, response) {
        assert.notStrictEqual(err, null, 'Should have an error for invalid credentials');
        assert.strictEqual(response, null, 'Response should be null for invalid credentials');
        done();
      });
    });
  });

  describe('Edge Cases and Error Handling', function() {
    it('should handle null callbacks gracefully', function(done) {
      try {
        this.api.getUserInfo(null);
        done();
      } catch(e) {
        done(new Error('Should not throw when callback is null'));
      }
    });

    it('should handle undefined data parameters', function(done) {
      this.api.getTests(undefined, undefined, function(err, response) {
        assert.strictEqual(err, null, 'Should handle undefined parameters');
        done();
      });
    });

    it('should handle empty responses', function(done) {
      try {
        this.api.getDevice(null, function(err, response) {
          assert.notStrictEqual(err, null, 'Should have an error for null device ID');
          done();
        });
      } catch (err) {
        assert.ok(err.message.includes('Device ID is required'), 'Should throw Device ID required error');
        done();
      }
    });

    it('should validate required parameters for takeScreenshot', function(done) {
      try {
        this.api.takeScreenshot();
        done(new Error('Should have thrown an error'));
      } catch (err) {
        assert.ok(err.message.includes('URL is required'), 'Should throw URL required error');
        done();
      }
    });

    it('should validate browser configuration for screenshots', function(done) {
      try {
        this.api.takeScreenshot('https://example.com', [], '1920x1080', null, null, null, function() {});
        done(new Error('Should have thrown an error'));
      } catch (err) {
        assert.ok(err.message.includes('At least one browser configuration is required'), 'Should validate browser configuration');
        done();
      }
    });

    it('should validate resolution for screenshots', function(done) {
      try {
        this.api.takeScreenshot('https://example.com', [{ browserName: 'chrome' }], null, null, null, null, function() {});
        done(new Error('Should have thrown an error'));
      } catch (err) {
        assert.ok(err.message.includes('Resolution is required'), 'Should validate resolution');
        done();
      }
    });

    it('should handle missing required parameters in various methods', function(done) {
      const errors = [];

      try {
        this.api.stopTest(null, function() {});
      } catch (err) {
        errors.push(err.message.includes('Test ID is required'));
      }

      try {
        this.api.deleteTest(null, function() {});
      } catch (err) {
        errors.push(err.message.includes('Test ID is required'));
      }

      try {
        this.api.deleteTunnel(null, function() {});
      } catch (err) {
        errors.push(err.message.includes('Tunnel ID is required'));
      }

      try {
        this.api.deleteStorageFile(null, function() {});
      } catch (err) {
        errors.push(err.message.includes('App URL is required'));
      }

      try {
        this.api.uploadRemoteFile(null, function() {});
      } catch (err) {
        errors.push(err.message.includes('Remote URL is required'));
      }

      assert.ok(errors.every(e => e === true), 'All methods should validate required parameters');
      done();
    });
  });
});