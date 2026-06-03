'use strict';

const assert = require('assert');
const querystring = require('querystring');
const { newClient } = require('./support/client');

// Capture the final axios request options a method builds, with NO network:
// stub _send (the single point every method funnels through) and inspect what
// it was handed. These tests lock in the correctness fixes from the audit.
function capture (invoke) {
  const api = newClient({ api_key: 'k', api_secret: 's' });
  let captured = null;
  api._send = function (requestOptions, callback) {
    captured = requestOptions;
    if (callback) callback(null, {});
    return Promise.resolve({});
  };
  invoke(api);
  return captured;
}

describe('Request shaping', function () {
  describe('audit fixes', function () {
    it('getTests sends count (not limit) as the page size', function () {
      const r = capture(api => api.getTests(0, 25));
      assert.strictEqual(r.method, 'GET');
      assert.match(r.url, /\/v1\/tests\/$/);
      assert.deepStrictEqual(r.params, { offset: 0, count: 25 });
      assert.ok(!('limit' in r.params), 'should not send a limit param');
    });

    it('getDevice puts the id in the path, not a query param', function () {
      const r = capture(api => api.getDevice('A123'));
      assert.strictEqual(r.url, 'https://api.testingbot.com/v1/devices/A123');
      assert.ok(!r.params, 'should not send a query param');
    });

    it('takeScreenshot uses snake_case option names', function () {
      const r = capture(api =>
        api.takeScreenshot('https://x', [{ browserName: 'chrome' }], '1280x1024', 5, true, 'https://cb')
      );
      assert.strictEqual(r.headers['Content-Type'], 'application/json');
      assert.strictEqual(r.data.wait_time, 5);
      assert.strictEqual(r.data.fullpage, true);
      assert.strictEqual(r.data.callback_url, 'https://cb');
      assert.ok(!('waitTime' in r.data) && !('fullPage' in r.data) && !('callbackURL' in r.data));
    });

    it('createUserInTeam sends flat top-level fields (no user[...] wrapper)', function () {
      const r = capture(api => api.createUserInTeam({ email: 'a@b.com', password: 'pw' }));
      const parsed = querystring.parse(r.data);
      assert.strictEqual(parsed.email, 'a@b.com');
      assert.strictEqual(parsed.password, 'pw');
      assert.ok(!r.data.includes('user'), 'should not nest under user[...]');
    });

    it('updateUserInfo wraps the body under user[...]', function () {
      const r = capture(api => api.updateUserInfo({ first_name: 'Jo' }));
      const parsed = querystring.parse(r.data);
      assert.strictEqual(parsed['user[first_name]'], 'Jo');
    });

    it('getStorageFile strips the tb:// prefix and encodes the appkey', function () {
      const r = capture(api => api.getStorageFile('tb://abc123'));
      assert.strictEqual(r.url, 'https://api.testingbot.com/v1/storage/abc123');
    });

    it('createSession merges caller capabilities over the defaults', function () {
      const r = capture(api => api.createSession({ capabilities: { browserName: 'firefox' } }));
      assert.strictEqual(r.url, 'https://cloud.testingbot.com/session');
      assert.strictEqual(r.data.capabilities.browserName, 'firefox');
      assert.strictEqual(r.data.capabilities.browserVersion, 'latest');
      assert.strictEqual(r.data.capabilities.platform, 'WIN10');
    });
  });

  describe('Tier-1 methods', function () {
    it('getIpRanges -> GET /v1/configuration/ip-ranges', function () {
      const r = capture(api => api.getIpRanges());
      assert.strictEqual(r.method, 'GET');
      assert.match(r.url, /\/v1\/configuration\/ip-ranges$/);
    });

    it('getTunnelById -> GET /v1/tunnel/:id', function () {
      const r = capture(api => api.getTunnelById(42));
      assert.strictEqual(r.method, 'GET');
      assert.strictEqual(r.url, 'https://api.testingbot.com/v1/tunnel/42');
    });

    it('deleteActiveTunnel -> DELETE /v1/tunnel', function () {
      const r = capture(api => api.deleteActiveTunnel());
      assert.strictEqual(r.method, 'DELETE');
      assert.strictEqual(r.url, 'https://api.testingbot.com/v1/tunnel');
    });

    it('getUserClientKey -> GET /v1/team-management/users/:id/client-key', function () {
      const r = capture(api => api.getUserClientKey(7));
      assert.strictEqual(r.url, 'https://api.testingbot.com/v1/team-management/users/7/client-key');
    });

    it('getUserKeys -> GET /v1/user/keys', function () {
      const r = capture(api => api.getUserKeys());
      assert.match(r.url, /\/v1\/user\/keys$/);
    });
  });
});
