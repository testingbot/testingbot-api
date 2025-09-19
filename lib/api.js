'use strict';

const querystring = require('querystring');
const fs = require('fs');
const path = require('path');
const request = require('request');
const crypto = require('crypto');
const os = require('os');

class TestingBot {
  constructor(options) {
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
  getDevices(callback) {
    var data = {};
    this.request({
      method: 'GET',
      url: '/devices',
      data: data
    }, callback);
  }
  getAvailableDevices(callback) {
    var data = {};
    this.request({
      method: 'GET',
      url: '/devices/available',
      data: data
    }, callback);
  }
  getDevice(deviceId, callback) {
    var data = {};
    if (deviceId) {
      data.deviceId = deviceId;
    }
    this.request({
      method: 'GET',
      url: '/devices/',
      data: data
    }, callback);
  }
  takeScreenshot(callback, url, browsers, waitTime, resolution, fullPage, callbackURL) {
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
  }
  retrieveScreenshots(screenshotId, callback) {
    var data = {};
    if (screenshotId) {
      data.screenshotId = screenshotId;
    }
    this.request({
      method: 'GET',
      url: '/screenshots',
      data: data
    }, callback);
  }
  getScreenshotList(callback, offset, limit) {
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
  }
  getBrowsers(callback, type) {
    var data = {};
    if (type) {
      data.type = type;
    }
    this.request({
      method: 'GET',
      url: '/browsers',
      data: data
    }, callback);
  }
  getUserInfo(callback) {
    this.request({
      method: 'GET',
      url: '/user'
    }, callback);
  }
  updateUserInfo(data, callback) {
    this.request({
      method: 'PUT',
      url: '/user',
      data: data
    }, callback);
  }
  getTests(callback, offset, limit) {
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
  }
  getTestDetails(testID, callback) {
    this.request({
      method: 'GET',
      url: '/tests/' + testID
    }, callback);
  }
  updateTest(data, testID, callback) {
    this.request({
      method: 'PUT',
      url: '/tests/' + testID,
      data: data
    }, callback);
  }
  deleteTest(testID, callback) {
    this.request({
      method: 'DELETE',
      url: '/tests/' + testID
    }, callback);
  }
  stopTest(testID, callback) {
    this.request({
      method: 'PUT',
      url: '/tests/' + testID + '/stop'
    }, callback);
  }
  getTunnel(callback) {
    this.request({
      method: 'GET',
      url: '/tunnel'
    }, callback);
  }
  getTunnelList(callback) {
    this.request({
      method: 'GET',
      url: '/tunnel/list'
    }, callback);
  }
  deleteTunnel(tunnelId, callback) {
    this.request({
      method: 'DELETE',
      url: '/tunnel/' + tunnelId
    }, callback);
  }
  getLabTests(callback, offset, limit) {
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
  }
  updateLabTest(data, testID, callback) {
    this.request({
      method: 'PUT',
      url: '/lab/' + testID,
      data: data
    }, callback);
  }
  getBuilds(callback, offset, limit) {
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
  }
  getTestsForBuild(buildId, callback) {
    this.request({
      method: 'GET',
      url: '/builds/' + buildId
    }, callback);
  }
  deleteBuild(buildId, callback) {
    this.request({
      method: 'DELETE',
      url: '/builds/' + buildId
    }, callback);
  }
  deleteLabTest(testID, callback) {
    this.request({
      method: 'DELETE',
      url: '/lab/' + testID
    }, callback);
  }
  uploadFile(localFilePath, callback) {
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

    request(requestOptions, function (error, response) {
      var responseBody = null;
      if (response) {
        if (response.body && typeof (response.body) === 'string') {
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
  }
  getTeam(callback) {
    this.request({
      method: 'GET',
      url: '/team-management'
    }, callback);
  }
  getUsersInTeam(callback) {
    this.request({
      method: 'GET',
      url: '/team-management/users'
    }, callback);
  }
  getUserFromTeam(userId, callback) {
    this.request({
      method: 'GET',
      url: '/team-management/users/' + userId
    }, callback);
  }
  createUserInTeam(user, callback) {
    this.request({
      method: 'POST',
      url: '/team-management/users/',
      data: {
        user: user
      }
    }, callback);
  }
  updateUserInTeam(userId, userData, callback) {
    this.request({
      method: 'PUT',
      url: '/team-management/users/' + userId,
      data: {
        user: userData
      }
    }, callback);
  }
  resetCredentials(userId, callback) {
    this.request({
      method: 'POST',
      url: '/team-management/users/' + userId + '/reset-keys'
    }, callback);
  }
  getStorageFile(appUrl, callback) {
    this.request({
      method: 'GET',
      url: '/storage/' + appUrl
    }, callback);
  }
  getStorageFiles(callback, offset, limit) {
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
  }
  deleteStorageFile(appUrl, callback) {
    this.request({
      method: 'DELETE',
      url: '/storage/' + appUrl
    }, callback);
  }
  uploadRemoteFile(remoteUrl, callback) {
    this.request({
      method: 'POST',
      url: '/storage/',
      data: {
        url: remoteUrl
      }
    }, callback);
  }
  getAuthenticationHashForSharing(sessionId) {
    return crypto.createHash('md5').update(this.options.api_key + ':' + this.options.api_secret + ':' + sessionId).digest('hex');
  }
  request(req_data, callback) {
    let requestPath = '/v1' + req_data.url;
    if (req_data.method === 'GET' && req_data.data) {
      requestPath = requestPath + '?' + querystring.stringify(req_data.data);
    }
    const requestOptions = {
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

    request(requestOptions, function (error, response) {
      let responseBody = null;
      if (response) {
        if (response.body && typeof (response.body) === 'string') {
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
  }
}


module.exports = TestingBot;
