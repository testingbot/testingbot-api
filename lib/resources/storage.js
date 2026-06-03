'use strict';

const fs = require('fs');
const FormData = require('form-data');
const { version } = require('../../package.json');

module.exports = {
  getStorageFile (appUrl, callback) {
    if (!appUrl) {
      throw new Error('App URL is required');
    }
    const appKey = String(appUrl).replace(/^tb:\/\//, '');
    return this.request({
      method: 'GET',
      url: '/storage/' + encodeURIComponent(appKey)
    }, callback);
  },

  getStorageFiles (offset, limit, callback) {
    if (offset == null) {
      offset = 0;
    }
    if (limit == null) {
      limit = 10;
    }

    return this.request({
      method: 'GET',
      url: '/storage',
      data: { offset, count: limit }
    }, callback);
  },

  deleteStorageFile (appUrl, callback) {
    if (!appUrl) {
      throw new Error('App URL is required');
    }
    const appKey = String(appUrl).replace(/^tb:\/\//, '');
    return this.request({
      method: 'DELETE',
      url: '/storage/' + encodeURIComponent(appKey)
    }, callback);
  },

  uploadRemoteFile (remoteUrl, callback) {
    if (!remoteUrl) {
      throw new Error('Remote URL is required');
    }
    return this.requestJson({
      method: 'POST',
      url: '/storage',
      data: {
        url: remoteUrl
      }
    }, callback);
  },

  uploadFile (localFilePath, callback) {
    try {
      fs.accessSync(localFilePath, fs.constants.R_OK);
    } catch (e) {
      const err = new Error('File not found or unreadable: ' + localFilePath);
      if (callback) {
        callback(err, null);
        return undefined;
      }
      return Promise.reject(err);
    }

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
      headers: {
        ...form.getHeaders(),
        'User-Agent': `testingbot-api-client v${version}`
      },
      validateStatus: () => true
    };

    return this._send(requestOptions, callback);
  }
};
