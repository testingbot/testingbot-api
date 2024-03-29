'use strict';

var querystring = require('querystring');
var fs = require('fs');
var path = require('path');
var request = require('request');
var crypto = require('crypto');
var os = require('os');

function TestingBot(options) {
  this.options = options || {};
  this.options.api_key = this.options.api_key || process.env.TESTINGBOT_KEY || process.env.TB_KEY || null;
  this.options.api_secret = this.options.api_secret || process.env.TESTINGBOT_SECRET || process.env.TB_SECRET || null;

  if (!this.options.api_key || !this.options.api_secret) {
    try {
      var tbFile = path.join(os.homedir(), '.testingbot');
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

TestingBot.prototype.getDevices = function(callback) {
  var data = {};
  this.request({
    method: 'GET',
    url: '/devices',
    data: data
  }, callback);
};

TestingBot.prototype.getAvailableDevices = function(callback) {
  var data = {};
  this.request({
    method: 'GET',
    url: '/devices/available',
    data: data
  }, callback);
};

TestingBot.prototype.getDevice = function(deviceId, callback) {
  var data = {};
  if (deviceId) {
    data.deviceId = deviceId;
  }
  this.request({
    method: 'GET',
    url: '/devices/',
    data: data
  }, callback);
};

TestingBot.prototype.takeScreenshot = function(callback, url, browsers, waitTime, resolution, fullPage, callbackURL) {
  var data = {};
  if (url) {
    data.url = url;
  }
  if (browsers) {
    data.browsers = browsers;
  }
  if (waitTime) {
    data.waitTime = waitTime;
  }
  if (resolution) {
    data.resolution = resolution;
  }
  if (fullPage) {
    data.fullPage = fullPage;
  }
  if (callbackURL) {
    data.callbackURL = callbackURL;
  }
  this.request({
    method: 'POST',
    url: '/screenshots',
    data: data
  }, callback);
};

TestingBot.prototype.retrieveScreenshots = function(screenshotId, callback) {
  var data = {};
  if (screenshotId) {
    data.screenshotId = screenshotId;
  }
  this.request({
    method: 'GET',
    url: '/screenshots',
    data: data
  }, callback);
};

TestingBot.prototype.getScreenshotList = function(callback, offset, limit) {
  if (!offset) {
    offset = 0;
  }
  if (!limit) {
    limit = 10;
  }
  this.request({
    method: 'GET',
    url: '/screenshots',
    data: { offset: offset, limit: limit }
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

TestingBot.prototype.getUserInfo = function(callback) {
  this.request({
    method: 'GET',
    url: '/user'
  }, callback);
};

TestingBot.prototype.updateUserInfo = function(data, callback) {
  this.request({
    method: 'PUT',
    url: '/user',
    data: data
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

TestingBot.prototype.getTestDetails = function(testID, callback) {
  this.request({
    method: 'GET',
    url: '/tests/' + testID
  }, callback);
};

TestingBot.prototype.updateTest = function(data, testID, callback) {
  this.request({
    method: 'PUT',
    url: '/tests/' + testID,
    data: data
  }, callback);
};

TestingBot.prototype.deleteTest = function(testID, callback) {
  this.request({
    method: 'DELETE',
    url: '/tests/' + testID
  }, callback);
};

TestingBot.prototype.stopTest = function(testID, callback) {
  this.request({
    method: 'PUT',
    url: '/tests/' + testID + '/stop'
  }, callback);
};

TestingBot.prototype.getTunnel = function(callback) {
  this.request({
    method: 'GET',
    url: '/tunnel'
  }, callback);
};

TestingBot.prototype.getTunnelList = function(callback) {
  this.request({
    method: 'GET',
    url: '/tunnel/list'
  }, callback);
};

TestingBot.prototype.deleteTunnel = function(tunnelId, callback) {
  this.request({
    method: 'DELETE',
    url: '/tunnel/' + tunnelId
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

TestingBot.prototype.updateLabTest = function(data, testID, callback) {
  this.request({
    method: 'PUT',
    url: '/lab/' + testID,
    data: data
  }, callback);
};

TestingBot.prototype.getBuilds = function(callback, offset, limit) {
  if (!offset) {
    offset = 0;
  }
  if (!limit) {
    limit = 10;
  }

  this.request({
    method: 'GET',
    url: '/builds?offset=' + offset + '&limit=' + limit
  }, callback);
};

TestingBot.prototype.getTestsForBuild = function(buildId, callback) {
  this.request({
    method: 'GET',
    url: '/builds/' + buildId
  }, callback);
};

TestingBot.prototype.deleteBuild = function(buildId, callback) {
  this.request({
    method: 'DELETE',
    url: '/builds/' + buildId
  }, callback);
};

TestingBot.prototype.deleteLabTest = function(testID, callback) {
  this.request({
    method: 'DELETE',
    url: '/lab/' + testID
  }, callback);
};

TestingBot.prototype.uploadFile = function(localFilePath, callback) {
  var requestOptions = {
    method: 'POST',
    uri: 'https://api.testingbot.com/v1/storage',
    auth: {
      user: this.options.api_key,
      pass: this.options.api_secret,
      sendImmediately: true
    },
    formData: {
      file: fs.createReadStream(localFilePath)
    }
  };

  request(requestOptions, function(error, response) {
    var responseBody = null;
    if (response) {
      if (response.body && typeof(response.body) === 'string') {
        response.body = JSON.parse(response.body);
      }
      if (response.statusCode.toString().substring(0, 1) === '2') {
        responseBody = response.body;
      } else {
        error = response.body;
      }
    }

    if (callback) {
      callback(error, responseBody);
    }
  });
};

TestingBot.prototype.getTeam = function(callback) {
  this.request({
    method: 'GET',
    url: '/team-management'
  }, callback);
};

TestingBot.prototype.getUsersInTeam = function(callback) {
  this.request({
    method: 'GET',
    url: '/team-management/users'
  }, callback);
};

TestingBot.prototype.getUserFromTeam = function(userId, callback) {
  this.request({
    method: 'GET',
    url: '/team-management/users/' + userId
  }, callback);
};

TestingBot.prototype.createUserInTeam = function(user, callback) {
  this.request({
    method: 'POST',
    url: '/team-management/users/',
    data: {
      user: user
    }
  }, callback);
};

TestingBot.prototype.updateUserInTeam = function(userId, userData, callback) {
  this.request({
    method: 'PUT',
    url: '/team-management/users/' + userId,
    data: {
      user: userData
    }
  }, callback);
};

TestingBot.prototype.resetCredentials = function(userId, callback) {
  this.request({
    method: 'POST',
    url: '/team-management/users/' + userId + '/reset-keys'
  }, callback);
};

TestingBot.prototype.getStorageFile = function(appUrl, callback) {
  this.request({
    method: 'GET',
    url: '/storage/' + appUrl
  }, callback);
};

TestingBot.prototype.getStorageFiles = function(callback, offset, limit) {
  if (!offset) {
    offset = 0;
  }
  if (!limit) {
    limit = 10;
  }

  this.request({
    method: 'GET',
    url: '/storage',
    data: { offset: offset, limit: limit }
  }, callback);
};

TestingBot.prototype.deleteStorageFile = function(appUrl, callback) {
  this.request({
    method: 'DELETE',
    url: '/storage/' + appUrl
  }, callback);
};

TestingBot.prototype.uploadRemoteFile = function(remoteUrl, callback) {
  this.request({
    method: 'POST',
    url: '/storage/',
    data: {
      url: remoteUrl
    }
  }, callback);
};

TestingBot.prototype.getAuthenticationHashForSharing = function(sessionId) {
  return crypto.createHash('md5').update(this.options.api_key + ':' + this.options.api_secret + ':' + sessionId).digest('hex');
};

TestingBot.prototype.request = function(req_data, callback) {
  var requestPath = '/v1' + req_data.url;
  if (req_data.method === 'GET' && req_data.data) {
    requestPath = requestPath + '?' + querystring.stringify(req_data.data);
  }
  var requestOptions = {
    method: req_data.method,
    uri: 'https://api.testingbot.com' + requestPath,
    auth: {
      user: this.options.api_key,
      pass: this.options.api_secret,
      sendImmediately: true
    }
  };

  if (req_data.method !== 'GET') {
    requestOptions.form = req_data.data;
  }

  request(requestOptions, function(error, response) {
    var responseBody = null;
    if (response) {
      if (response.body && typeof(response.body) === 'string') {
        response.body = JSON.parse(response.body);
      }
      if (response.statusCode.toString().substring(0, 1) === '2') {
        responseBody = response.body;
      } else {
        error = response.body;
      }
    }
    if (callback) {
      callback(error, responseBody);
    }
  });
};

module.exports = TestingBot;
