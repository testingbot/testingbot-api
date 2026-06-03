'use strict';

// Shared test harness. Most resource tests are integration tests that hit the
// live API and need TB_KEY/TB_SECRET (or ~/.testingbot). `bothModes` lets a
// test assert that a method behaves identically in callback and promise mode.

const TestingBot = require('../../index.js');

function newClient (options) {
  return new TestingBot(options);
}

// True when credentials are available somewhere the client can find them.
function hasCredentials () {
  const c = newClient();
  return Boolean(c.options.api_key && c.options.api_secret);
}

// Run the same call in callback mode and promise mode; resolves with
// [callbackResult, promiseResult]. `invoke(client, cb)` should call the method,
// passing `cb` straight through (undefined in promise mode triggers a Promise).
function bothModes (invoke) {
  const viaCallback = new Promise((resolve, reject) => {
    invoke(newClient(), (err, data) => (err ? reject(err) : resolve(data)));
  });
  const viaPromise = invoke(newClient());
  return Promise.all([viaCallback, viaPromise]);
}

module.exports = { TestingBot, newClient, hasCredentials, bothModes };
