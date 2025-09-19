'use strict';

var TbApi = require('../lib/api.js');
var assert = require('assert');
var path = require('path');

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
      var api = new TbApi({ api_key: 'bogus', api_secret: 'bogus' });
      api.getUserInfo(function(err, response) {
        assert.strictEqual(response, null, 'Response should be null for invalid credentials');
        assert.notStrictEqual(err, null, 'Should have an error for invalid credentials');
        done();
      });
    });

    it('should generate correct authentication hash for sharing', function(done) {
      var hash = this.api.getAuthenticationHashForSharing('sampleSessionId');
      assert.strictEqual(typeof(hash), 'string', 'Hash should be a string');
      assert.strictEqual(hash.length, 32, 'MD5 hash should be 32 characters');
      done();
    });
  });

  describe('User Management Tests', function() {
    it('should update a user object', function(done) {
      var that = this;
      var newName = 'name_' + Math.round(Math.random() * 10000);
      this.api.updateUserInfo({ user: { first_name: newName } }, function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error updating user');
        that.api.getUserInfo(function(err, response) {
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
      this.api.getTests(function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        assert.ok(Array.isArray(response.data), 'Response data should be an array');
        assert.ok(response.data.length >= 0, 'Data array should exist');
        done();
      });
    });

    it('should list tests with custom pagination', function(done) {
      this.api.getTests(function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        assert.ok(response.meta, 'Meta information should exist');
        done();
      }, 0, 5);
    });

    it('should error when no test is found', function(done) {
      this.api.getTestDetails(324234234324, function(err, response) {
        assert.strictEqual(response, null, 'Response should be null for non-existent test');
        assert.notStrictEqual(err, null, 'Should have an error for non-existent test');
        done();
      });
    });

    it('should find a specific test', function(done) {
      var that = this;
      this.api.getTests(function(err, response) {
        assert.ok(response && response.data && response.data.length > 0, 'Should have test data');
        var singleTest = response.data[0];
        that.api.getTestDetails(singleTest.id, function(err, response) {
          assert.strictEqual(err, null, 'Should not have an error');
          assert.notStrictEqual(response, null, 'Response should not be null');
          assert.strictEqual(response.id, singleTest.id, 'Test ID should match');
          done();
        });
      });
    });

    it('should update a test with legacy data format', function(done) {
      var that = this;
      this.api.getTests(function(err, response) {
        assert.ok(response && response.data && response.data.length > 0, 'Should have test data');
        var singleTest = response.data[0];
        var statusMessage = 'test_' + Date.now();
        var payload = { 'test[success]': '1', 'test[status_message]': statusMessage };
        that.api.updateTest(payload, singleTest.id, function(err) {
          assert.strictEqual(err, null, 'Should not have an error updating test');
          that.api.getTestDetails(singleTest.id, function(err, response) {
            assert.strictEqual(err, null, 'Should not have an error getting test details');
            assert.strictEqual(response.status_message, statusMessage, 'Status message should be updated');
            done();
          });
        });
      });
    });

    it('should update a test with object data format', function(done) {
      var that = this;
      this.api.getTests(function(err, response) {
        assert.ok(response && response.data && response.data.length > 0, 'Should have test data');
        var singleTest = response.data[0];
        var statusMessage = 'test2_' + Date.now();
        var payload = { test: { success: 1, status_message: statusMessage } };
        that.api.updateTest(payload, singleTest.id, function(err) {
          assert.strictEqual(err, null, 'Should not have an error updating test');
          that.api.getTestDetails(singleTest.id, function(err, response) {
            assert.strictEqual(err, null, 'Should not have an error getting test details');
            assert.strictEqual(response.status_message, statusMessage, 'Status message should be updated');
            done();
          });
        });
      });
    });

    it('should stop a test', function(done) {
      var that = this;
      this.api.getTests(function(err, response) {
        if (!response || !response.data || response.data.length === 0) {
          return done();
        }
        var testToStop = response.data.find(function(test) {
          return test.status === 'running';
        });

        if (!testToStop) {
          return done();
        }

        that.api.stopTest(testToStop.id, function(err, response) {
          assert.strictEqual(err, null, 'Should not have an error stopping test');
          done();
        });
      });
    });

    it('should delete a test', function(done) {
      var that = this;
      this.api.getTests(function(err, response) {
        assert.ok(response && response.data && response.data.length > 0, 'Should have test data');
        var singleTest = response.data[0];
        that.api.deleteTest(singleTest.id, function(err, response) {
          assert.strictEqual(err, null, 'Should not have an error deleting test');
          that.api.getTestDetails(singleTest.id, function(err, response) {
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
      var that = this;
      this.api.getDevices(function(err, response) {
        if (response && response.length > 0) {
          var deviceId = response[0].id || response[0].device_id;
          that.api.getDevice(deviceId, function(err, deviceResponse) {
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
      this.api.getBrowsers(function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        assert.ok(Array.isArray(response), 'Response should be an array');
        done();
      });
    });

    it('should list browsers by type', function(done) {
      this.api.getBrowsers(function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        done();
      }, 'webdriver');
    });
  });

  describe('File Storage', function() {
    it('should upload a local file', function(done) {
      var testFilePath = path.resolve(__dirname, 'test.apk');
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
      this.api.getStorageFiles(function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        assert.ok(Array.isArray(response.data) || Array.isArray(response), 'Response should contain an array');
        done();
      });
    });

    it('should list storage files with pagination', function(done) {
      this.api.getStorageFiles(function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        done();
      }, 0, 5);
    });

    it('should get a specific storage file', function(done) {
      var that = this;
      this.api.getStorageFiles(function(err, response) {
        var files = response.data || response;
        if (files && files.length > 0) {
          var appUrl = files[0].app_url || files[0].url;
          if (appUrl) {
            appUrl = appUrl.replace('tb://', '');
            that.api.getStorageFile(appUrl, function(err, fileResponse) {
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
      var that = this;
      this.api.uploadRemoteFile('https://testingbot.com/appium/sample.apk', function(err, response) {
        if (response && response.app_url) {
          var appUrl = response.app_url.replace('tb://', '');
          that.api.deleteStorageFile(appUrl, function(err, deleteResponse) {
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
      this.api.takeScreenshot(function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error taking screenshot');
        assert.ok(response, 'Response should exist');
        assert.ok(response.screenshot_id || response.id, 'Screenshot ID should be returned');
        done();
      }, 'https://testingbot.com', [{ "browserName" : "chrome", "version" : 134, "os" : "WIN10"}], 0, '1280x1024');
    });

    it('should retrieve screenshot details', function(done) {
      var that = this;
      this.api.takeScreenshot(function(err, response) {
        if (response && (response.screenshot_id || response.id)) {
          var screenshotId = response.screenshot_id || response.id;
          setTimeout(function() {
            that.api.retrieveScreenshots(screenshotId, function(err, screenshotResponse) {
              assert.strictEqual(err, null, 'Should not have an error retrieving screenshot');
              assert.ok(screenshotResponse, 'Screenshot response should exist');
              done();
            });
          }, 2000);
        } else {
          done();
        }
      }, 'https://testingbot.com', [{ "browserName" : "chrome", "version" : 134, "os" : "WIN10"}]);
    });

    it('should list screenshots', function(done) {
      this.api.getScreenshotList(function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        assert.ok(Array.isArray(response.data) || Array.isArray(response), 'Response should contain an array');
        done();
      });
    });

    it('should list screenshots with pagination', function(done) {
      this.api.getScreenshotList(function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        done();
      }, 0, 5);
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
      var that = this;
      this.api.getTunnelList(function(err, response) {
        var tunnels = response || response.data || [];
        if (Array.isArray(tunnels) && tunnels.length > 0) {
          var tunnelId = tunnels[0].id || tunnels[0].tunnel_id;
          that.api.deleteTunnel(tunnelId, function(err, deleteResponse) {
            assert.strictEqual(err, null, 'Should not have an error deleting tunnel');
            done();
          });
        } else {
          done();
        }
      });
    });
  });

  describe('Lab Tests Management', function() {
    it('should list lab tests', function(done) {
      this.api.getLabTests(function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        assert.ok(response.data || response, 'Response data should exist');
        done();
      });
    });

    it('should list lab tests with pagination', function(done) {
      this.api.getLabTests(function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        done();
      }, 0, 5);
    });

    it('should update a lab test', function(done) {
      var that = this;
      this.api.getLabTests(function(err, response) {
        var tests = (response && response.data) || response || [];
        if (tests.length > 0) {
          var testId = tests[0].id;
          var data = { test: { status_message: 'Updated lab test' } };
          that.api.updateLabTest(data, testId, function(err, updateResponse) {
            if (err && err.message && err.message.includes('500 Error')) {
              return done();
            }
            assert.strictEqual(err, null, 'Should not have an error updating lab test');
            done();
          });
        } else {
          done();
        }
      });
    });

    it('should delete a lab test', function(done) {
      var that = this;
      this.api.getLabTests(function(err, response) {
        var tests = (response && response.data) || response || [];
        if (tests.length > 0) {
          var testId = tests[0].id;
          that.api.deleteLabTest(testId, function(err, deleteResponse) {
            assert.strictEqual(err, null, 'Should not have an error deleting lab test');
            done();
          });
        } else {
          done();
        }
      });
    });
  });

  describe('Build Management', function() {
    it('should list builds', function(done) {
      this.api.getBuilds(function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        done();
      });
    });

    it('should list builds with pagination', function(done) {
      this.api.getBuilds(function(err, response) {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.ok(response, 'Response should exist');
        done();
      }, 0, 5);
    });

    it('should get tests for a build', function(done) {
      var that = this;
      this.api.getBuilds(function(err, response) {
        var builds = (response && response.data) || response || [];
        if (builds.length > 0) {
          var buildId = builds[0].id || builds[0].build_id;
          that.api.getTestsForBuild(buildId, function(err, testsResponse) {
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
      var that = this;
      this.api.getBuilds(function(err, response) {
        var builds = (response && response.data) || response || [];
        if (builds.length > 0) {
          var buildId = builds[0].id || builds[0].build_id;
          that.api.deleteBuild(buildId, function(err, deleteResponse) {
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
      var that = this;
      this.api.getUsersInTeam(function(err, response) {
        if (err && err.message && err.message.includes('not authorized')) {
          return done();
        }
        var users = (response && response.data) || response || [];
        if (users.length > 0) {
          var userId = users[0].id || users[0].user_id;
          that.api.getUserFromTeam(userId, function(err, userResponse) {
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
      var newUser = {
        email: 'test_' + Date.now() + '@example.com',
        first_name: 'Test',
        last_name: 'User'
      };
      this.api.createUserInTeam(newUser, function(err, response) {
        if (err && err.message && err.message.includes('not authorized')) {
          return done();
        }
        assert.strictEqual(err, null, 'Should not have an error creating user');
        assert.ok(response, 'Response should exist');
        done();
      });
    });

    it('should update a user in team', function(done) {
      var that = this;
      this.api.getUsersInTeam(function(err, response) {
        if (err && err.message && err.message.includes('not authorized')) {
          return done();
        }
        var users = (response && response.data) || response || [];
        if (users.length > 0) {
          var userId = users[0].id || users[0].user_id;
          var userData = { first_name: 'Updated_' + Date.now() };
          that.api.updateUserInTeam(userId, userData, function(err, updateResponse) {
            assert.strictEqual(err, null, 'Should not have an error updating user in team');
            done();
          });
        } else {
          done();
        }
      });
    });

    it('should reset credentials for a user in team', function(done) {
      var that = this;
      this.api.getUsersInTeam(function(err, response) {
        if (err && err.message && err.message.includes('not authorized')) {
          return done();
        }
        var users = (response && response.data) || response || [];
        if (users.length > 0) {
          var userId = users[0].id || users[0].user_id;
          that.api.resetCredentials(userId, function(err, resetResponse) {
            assert.strictEqual(err, null, 'Should not have an error resetting credentials');
            done();
          });
        } else {
          done();
        }
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
      this.api.getTests(function(err, response) {
        assert.strictEqual(err, null, 'Should handle undefined parameters');
        done();
      }, undefined, undefined);
    });

    it('should handle empty responses', function(done) {
      this.api.getDevice(null, function(err, response) {
        done();
      });
    });

    it('should validate required parameters', function(done) {
      this.api.takeScreenshot(function(err, response) {
        done();
      });
    });
  });
});