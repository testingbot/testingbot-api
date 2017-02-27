'use strict';

var querystring = require('qs');
var fs = require('fs');
var path = require('path');
var request = require('request');

function TestingBot(options) {
  this.options = options || {};
  this.options.api_key = this.options.api_key || process.env.TESTINGBOT_KEY || null;
  this.options.api_secret = this.options.api_secret || process.env.TESTINGBOT_SECRET || null;

  if (!this.options.api_key || !this.options.api_secret) {
    try {
      var tbFile = path.join(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'], '.testingbot');
      if (fs.statSync(tbFile).isFile() === true) {
        var data = fs.readFileSync(tbFile);
        if (data !== null) {
          var arr = data.toString().replace('\n', '').split(':');
          this.options.api_key = arr[0];
          this.options.api_secret = arr[1];
        }
      }
    } catch (e) {

    }
  }
}

TestingBot.prototype.getTestDetails = function(testID, callback) {
  this.request({
    method: 'GET',
    url: '/tests/' + testID
  }, callback);
};

TestingBot.prototype.getBrowsers = function(callback, type) {
  var data = {};
  if (type) {
    data.type = type;
  }
  this.request({
    method: 'GET',
    url: '/browsers',
    data: data
  }, callback);
};

TestingBot.prototype.getLabTestDetails = function(testID, callback) {
  this.request({
    method: 'GET',
    url: '/lab/' + testID
  }, callback);
};

TestingBot.prototype.getTunnel = function(callback) {
  this.request({
    method: 'GET',
    url: '/tunnel'
  }, callback);
};

TestingBot.prototype.getUserInfo = function(callback) {
  this.request({
    method: 'GET',
    url: '/user'
  }, callback);
};

TestingBot.prototype.getTests = function(callback, offset, limit) {
  if (!offset) {
    offset = 0;
  }
  if (!limit) {
    limit = 10;
  }
  this.request({
    method: 'GET',
    url: '/tests/',
    data: { offset: offset, limit: limit }
  }, callback);
};

TestingBot.prototype.getLabTests = function(callback, offset, limit) {
  if (!offset) {
    offset = 0;
  }
  if (!limit) {
    limit = 10;
  }
  this.request({
    method: 'GET',
    url: '/lab',
    data: { offset: offset, limit: limit }
  }, callback);
};

TestingBot.prototype.updateUserInfo = function(data, callback) {
  this.request({
    method: 'PUT',
    url: '/user',
    data: data
  }, callback);
};

TestingBot.prototype.updateTest = function(data, testID, callback) {
  this.request({
    method: 'PUT',
    url: '/tests/' + testID,
    data: data
  }, callback);
};

TestingBot.prototype.updateLabTest = function(data, testID, callback) {
  this.request({
    method: 'PUT',
    url: '/lab/' + testID,
    data: data
  }, callback);
};

TestingBot.prototype.deleteTest = function(testID, callback) {
  this.request({
    method: 'DELETE',
    url: '/tests/' + testID
  }, callback);
};

TestingBot.prototype.deleteLabTest = function(testID, callback) {
  this.request({
    method: 'DELETE',
    url: '/lab/' + testID
  }, callback);
};

TestingBot.prototype.request = function(req_data, callback) {
  var requestPath = '/v1/' + req_data.url;
  if (req_data.method === 'GET' && req_data.data) {
    requestPath = requestPath + '?' + querystring.stringify(req_data.data);
  }

  request({
    method: req_data.method,
    uri: 'https://api.testingbot.com' + requestPath,
    auth: {
      user: this.options.api_key,
      pass: this.options.api_secret,
      sendImmediately: true
    }
  }, function(error, response) {
    var responseBody = null;
    if (response.statusCode.toString().substring(0, 1) === '2') {
      responseBody = JSON.parse(response.body);
    } else {
      error = JSON.parse(response.body);
    }
    callback(error, responseBody);
  });
};

module.exports = TestingBot;
