'use strict';

const querystring = require('querystring');
const fs = require('fs');
const path = require('path');
const os = require('os');
const axios = require('axios');
const crypto = require('crypto');
const { version } = require('../package.json');
const { NetworkError } = require('./errors');
const { buildHttpError } = require('./http-error');

// Flatten nested objects for form-encoded data (turns { a: { b: c } } into a[b]=c).
function flattenObject (obj, prefix = '') {
  const flattened = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    const newKey = prefix ? prefix + '[' + key + ']' : key;
    if (Array.isArray(value)) {
      // Encode arrays as repeated `[]`-suffixed keys (groups[]=a&groups[]=b) so
      // the server keeps every value. Plain `key=a&key=b` is collapsed to the
      // last value by Rack. See issue #24.
      flattened[newKey + '[]'] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  });
  return flattened;
}

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
      const data = fs.readFileSync(tbFile);
      if (data !== null) {
        const text = data.toString().trim();
        const idx = text.indexOf(':');
        if (idx !== -1) {
          this.options.api_key = text.slice(0, idx);
          this.options.api_secret = text.slice(idx + 1);
        }
      }
    } catch (e) {
    }
  }

  // Issue a prepared axios request, returning a Promise or invoking the optional
  // callback. Non-2xx responses and transport failures become typed errors.
  // Shared by request(), uploadFile() and createSession().
  _send (requestOptions, callback) {
    const run = async (resolve, reject) => {
      try {
        const response = await axios(requestOptions);
        let body = response.data;
        let error = null;

        if (!(response.status >= 200 && response.status < 300)) {
          error = buildHttpError(response.status, body, response.headers);
          body = null;
        }

        if (callback) {
          callback(error, body);
        } else if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      } catch (err) {
        const error = err.response
          ? buildHttpError(err.response.status, err.response.data, err.response.headers)
          : new NetworkError(err.message, err);
        if (callback) {
          callback(error, null);
        } else {
          reject(error);
        }
      }
    };

    if (callback) {
      run();
      return undefined;
    }

    return new Promise(run);
  }

  // Build and send a request against the REST API (prepends /v1, attaches
  // Basic Auth, form-encodes non-GET bodies unless `json` is set).
  request (reqData, callback) {
    const requestOptions = {
      method: reqData.method,
      url: 'https://api.testingbot.com/v1' + reqData.url,
      auth: {
        username: this.options.api_key,
        password: this.options.api_secret
      },
      headers: {
        'User-Agent': `testingbot-api-client v${version}`
      },
      validateStatus: () => true // Accept any status code to handle errors ourselves
    };

    if (reqData.method === 'GET' && reqData.data) {
      requestOptions.params = reqData.data;
    } else if (reqData.method !== 'GET') {
      if (reqData.json) {
        requestOptions.headers['Content-Type'] = 'application/json';
        requestOptions.data = reqData.data;
      } else {
        requestOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        requestOptions.data = querystring.stringify(flattenObject(reqData.data || {}));
      }
    }

    return this._send(requestOptions, callback);
  }

  requestJson (reqData, callback) {
    reqData.json = true;
    return this.request(reqData, callback);
  }

  getAuthenticationHashForSharing (sessionId) {
    return crypto.createHash('md5').update(this.options.api_key + ':' + this.options.api_secret + ':' + sessionId).digest('hex');
  }
}

module.exports = TestingBot;
