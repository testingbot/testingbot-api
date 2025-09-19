'use strict';

var TbApi = require('../lib/api.js');
var assert = require('assert');

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
  });
});