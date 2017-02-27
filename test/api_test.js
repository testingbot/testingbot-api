'use strict';
var TbApi = require('../lib/api.js');
var assert = require('assert');

describe('Api Tests', function() {
  beforeEach(function(done) {
    this.api = new TbApi();
    done();
  });

  it('should get the userinfo for the current user', function(done) {
    this.api.getUserInfo(function(err, response) {
       assert.equal(true, (typeof(response.first_name) === 'string'));
       assert.equal(true, (response.plan !== undefined));
      done();
     });
  });

  it('should detect wrong credentials', function(done) {
    var api = new TbApi({api_key: 'bogus', api_secret: 'bogus'});
    api.getUserInfo(function(err, response) {
      assert.equal(response, null);
      assert.notEqual(err, null);
      done();
    });
  });

  it('should list tests', function(done) {
    this.api.getTests(function(err, response) {
      assert.equal(response.data && response.data.length > 0, true);
      done();
    });
  });

  it('should error when not test is found', function(done) {
    this.api.getTestDetails(324234234324, function(err, response) {
      assert.equal(null, response);
      assert.notEqual(err, null);
      done();
    });
  });

  it('should find a specific test', function(done) {
    var that = this;
    this.api.getTests(function(err, response) {
      assert.equal(response.data && response.data.length > 0, true);
      var singleTest = response.data[0];
      that.api.getTestDetails(singleTest.id, function(err, response) {
        assert.notEqual(response, null);      
        done();
      });
    });
  });

  it('should update a user object', function(done) {
    var that = this;
    var newName = "name_" + Math.round(Math.random()*10000);
    this.api.updateUserInfo({ user: { first_name : newName } }, function(err, response) {
      assert.equal(err, null);
      that.api.getUserInfo(function(err, response) {
        assert.notEqual(response, null);
        assert.equal(err, null);
        assert.equal(response.first_name, newName);
        done();
      });
    });
  });
});