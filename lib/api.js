'use strict';

const querystring = require('querystring');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');
const FormData = require('form-data');
const os = require('os');

class TestingBot {
  constructor (options) {
    this.options = options || {};
    this.options.api_key = this.options.api_key || process.env.TESTINGBOT_KEY || process.env.TB_KEY || null;
    this.options.api_secret = this.options.api_secret || process.env.TESTINGBOT_SECRET || process.env.TB_SECRET || null;

    if (!this.options.api_key || !this.options.api_secret) {
      this._loadConfig();
    }
  }

  _loadConfig () {
    try {
      const tbFile = path.join(os.homedir(), '.testingbot');
      if (fs.statSync(tbFile).isFile() === true) {
        const data = fs.readFileSync(tbFile);
        if (data !== null) {
          const arr = data.toString().replace('\n', '').split(':');
          this.options.api_key = arr[0];
          this.options.api_secret = arr[1];
        }
      }
    } catch (e) {
    }
  }

  getDevices (callback) {
    return this.request({
      method: 'GET',
      url: '/devices',
      data: {}
    }, callback);
  }

  getAvailableDevices (callback) {
    return this.request({
      method: 'GET',
      url: '/devices/available',
      data: {}
    }, callback);
  }

  getDevice (deviceId, callback) {
    const data = {
      deviceId
    };

    return this.request({
      method: 'GET',
      url: '/devices/',
      data
    }, callback);
  }

  takeScreenshot (callback, url, browsers, waitTime, resolution, fullPage, callbackURL) {
    const data = {};
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

    return this.requestJson({
      method: 'POST',
      url: '/screenshots',
      data
    }, callback);
  }

  retrieveScreenshots (screenshotId, callback) {
    const data = {
      screenshotId
    };

    return this.request({
      method: 'GET',
      url: '/screenshots',
      data
    }, callback);
  }

  getScreenshotList (callback, offset, limit) {
    if (!offset) {
      offset = 0;
    }
    if (!limit) {
      limit = 10;
    }

    return this.request({
      method: 'GET',
      url: '/screenshots',
      data: { offset, limit }
    }, callback);
  }

  getBrowsers (callback, type) {
    const data = {};
    if (type) {
      data.type = type;
    }

    return this.request({
      method: 'GET',
      url: '/browsers',
      data
    }, callback);
  }

  getUserInfo (callback) {
    return this.request({
      method: 'GET',
      url: '/user'
    }, callback);
  }

  updateUserInfo (data, callback) {
    return this.request({
      method: 'PUT',
      url: '/user',
      data
    }, callback);
  }

  getTests (callback, offset, limit) {
    if (!offset) {
      offset = 0;
    }
    if (!limit) {
      limit = 10;
    }

    return this.request({
      method: 'GET',
      url: '/tests/',
      data: { offset, limit }
    }, callback);
  }

  getTestDetails (testID, callback) {
    return this.request({
      method: 'GET',
      url: '/tests/' + testID
    }, callback);
  }

  updateTest (data, testID, callback) {
    return this.request({
      method: 'PUT',
      url: '/tests/' + testID,
      data
    }, callback);
  }

  deleteTest (testID, callback) {
    return this.request({
      method: 'DELETE',
      url: '/tests/' + testID
    }, callback);
  }

  stopTest (testID, callback) {
    return this.request({
      method: 'PUT',
      url: '/tests/' + testID + '/stop'
    }, callback);
  }

  getTunnel (callback) {
    return this.request({
      method: 'GET',
      url: '/tunnel'
    }, callback);
  }

  getTunnelList (callback) {
    return this.request({
      method: 'GET',
      url: '/tunnel/list'
    }, callback);
  }

  deleteTunnel (tunnelId, callback) {
    return this.request({
      method: 'DELETE',
      url: '/tunnel/' + tunnelId
    }, callback);
  }

  getLabTests (callback, offset, limit) {
    if (!offset) {
      offset = 0;
    }
    if (!limit) {
      limit = 10;
    }

    return this.request({
      method: 'GET',
      url: '/lab',
      data: { offset, limit }
    }, callback);
  }

  updateLabTest (data, testID, callback) {
    return this.request({
      method: 'PUT',
      url: '/lab/' + testID,
      data
    }, callback);
  }

  getBuilds (callback, offset, limit) {
    if (!offset) {
      offset = 0;
    }
    if (!limit) {
      limit = 10;
    }

    return this.request({
      method: 'GET',
      url: '/builds?offset=' + offset + '&limit=' + limit
    }, callback);
  }

  getTestsForBuild (buildId, callback) {
    return this.request({
      method: 'GET',
      url: '/builds/' + buildId
    }, callback);
  }

  deleteBuild (buildId, callback) {
    return this.request({
      method: 'DELETE',
      url: '/builds/' + buildId
    }, callback);
  }

  deleteLabTest (testID, callback) {
    return this.request({
      method: 'DELETE',
      url: '/lab/' + testID
    }, callback);
  }

  uploadFile (localFilePath, callback) {
    const executeRequest = async (resolve, reject) => {
      const form = new FormData();
      form.append('file', fs.createReadStream(localFilePath));

      const requestOptions = {
        method: 'POST',
        url: 'https://api.testingbot.com/v1/storage',
        auth: {
          username: this.options.api_key,
          password: this.options.api_secret
        },
        data: form,
        headers: form.getHeaders(),
        validateStatus: function (status) {
          return true; // Accept any status code to handle errors ourselves
        }
      };

      try {
        const response = await axios(requestOptions);
        let responseBody = response.data;
        let error = null;

        if (response.status.toString().substring(0, 1) !== '2') {
          error = responseBody;
          responseBody = null;
        }

        if (callback) {
          callback(error, responseBody);
        } else if (resolve && reject) {
          if (error) {
            reject(error);
          } else {
            resolve(responseBody);
          }
        }
      } catch (err) {
        const error = err.response ? err.response.data : err.message;
        if (callback) {
          callback(error, null);
        } else if (reject) {
          reject(error);
        }
      }
    };

    if (callback) {
      executeRequest(null, null);
      return;
    }

    return new Promise(executeRequest);
  }

  getTeam (callback) {
    return this.request({
      method: 'GET',
      url: '/team-management'
    }, callback);
  }

  getUsersInTeam (callback) {
    return this.request({
      method: 'GET',
      url: '/team-management/users'
    }, callback);
  }

  getUserFromTeam (userId, callback) {
    return this.request({
      method: 'GET',
      url: '/team-management/users/' + userId
    }, callback);
  }

  createUserInTeam (user, callback) {
    return this.request({
      method: 'POST',
      url: '/team-management/users/',
      data: {
        user
      }
    }, callback);
  }

  updateUserInTeam (userId, userData, callback) {
    return this.request({
      method: 'PUT',
      url: '/team-management/users/' + userId,
      data: {
        user: userData
      }
    }, callback);
  }

  resetCredentials (userId, callback) {
    return this.request({
      method: 'POST',
      url: '/team-management/users/' + userId + '/reset-keys'
    }, callback);
  }

  getStorageFile (appUrl, callback) {
    return this.request({
      method: 'GET',
      url: '/storage/' + appUrl
    }, callback);
  }

  getStorageFiles (callback, offset, limit) {
    if (!offset) {
      offset = 0;
    }
    if (!limit) {
      limit = 10;
    }

    return this.request({
      method: 'GET',
      url: '/storage',
      data: { offset, limit }
    }, callback);
  }

  deleteStorageFile (appUrl, callback) {
    return this.request({
      method: 'DELETE',
      url: '/storage/' + appUrl
    }, callback);
  }

  uploadRemoteFile (remoteUrl, callback) {
    return this.requestJson({
      method: 'POST',
      url: '/storage',
      data: {
        url: remoteUrl
      }
    }, callback);
  }

  getAuthenticationHashForSharing (sessionId) {
    return crypto.createHash('md5').update(this.options.api_key + ':' + this.options.api_secret + ':' + sessionId).digest('hex');
  }

  request (reqData, callback) {
    const executeRequest = async (resolve, reject) => {
      const requestPath = '/v1' + reqData.url;
      const requestOptions = {
        method: reqData.method,
        url: 'https://api.testingbot.com' + requestPath,
        auth: {
          username: this.options.api_key,
          password: this.options.api_secret
        },
        validateStatus: function (status) {
          return true; // Accept any status code to handle errors ourselves
        }
      };

      if (reqData.method === 'GET' && reqData.data) {
        requestOptions.params = reqData.data;
      } else if (reqData.method !== 'GET') {
        if (reqData.json) {
          requestOptions.headers = { 'Content-Type': 'application/json' };
          requestOptions.data = reqData.data;
        } else {
          requestOptions.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
          // Flatten nested objects for form-encoded data
          const flattenObject = (obj, prefix = '') => {
            const flattened = {};
            Object.keys(obj).forEach(key => {
              const value = obj[key];
              const newKey = prefix ? prefix + '[' + key + ']' : key;
              if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                Object.assign(flattened, flattenObject(value, newKey));
              } else {
                flattened[newKey] = value;
              }
            });
            return flattened;
          };
          requestOptions.data = querystring.stringify(flattenObject(reqData.data || {}));
        }
      }

      try {
        const response = await axios(requestOptions);
        let responseBody = response.data;
        let error = null;

        if (response.status.toString().substring(0, 1) !== '2') {
          error = responseBody;
          responseBody = null;
        }

        if (callback) {
          callback(error, responseBody);
        } else if (resolve && reject) {
          if (error) {
            reject(error);
          } else {
            resolve(responseBody);
          }
        }
      } catch (err) {
        const error = err.response ? err.response.data : err.message;
        if (callback) {
          callback(error, null);
        } else if (reject) {
          reject(error);
        }
      }
    };

    if (callback) {
      executeRequest(null, null);
      return;
    }

    return new Promise(executeRequest);
  }

  requestJson (reqData, callback) {
    reqData.json = true;

    return this.request(reqData, callback);
  }
}

module.exports = TestingBot;
