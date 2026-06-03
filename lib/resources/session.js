'use strict';

const { version } = require('../../package.json');

module.exports = {
  // Create a live browser/cloud session (hits cloud.testingbot.com, not the
  // REST API host). Merges caller capabilities over sensible defaults.
  createSession (options, callback) {
    const defaultCapabilities = {
      browserName: 'chrome',
      browserVersion: 'latest',
      platform: 'WIN10'
    };

    let capabilities = defaultCapabilities;
    if (options && options.capabilities) {
      capabilities = { ...defaultCapabilities, ...options.capabilities };
    }

    // Spread the caller's other options first, then apply the merged
    // capabilities last so the defaults are not clobbered.
    const restOptions = { ...(options || {}) };
    delete restOptions.capabilities;

    const sessionPayload = {
      key: this.options.api_key,
      secret: this.options.api_secret,
      ...restOptions,
      capabilities
    };

    const requestOptions = {
      method: 'POST',
      url: 'https://cloud.testingbot.com/session',
      data: sessionPayload,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `testingbot-api-client v${version}`
      },
      validateStatus: () => true
    };

    return this._send(requestOptions, callback);
  }
};
