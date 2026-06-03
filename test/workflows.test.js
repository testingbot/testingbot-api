'use strict';

const assert = require('assert');
const { newClient } = require('./support/client');

// Workflow helpers are built on the resource methods, so we stub those methods
// (no network) and assert the helper logic — pagination, aggregation, polling.
describe('Workflow helpers', function () {
  it('getAllTests unwraps { data, meta } and pages until a short page', async function () {
    const api = newClient({ api_key: 'k', api_secret: 's' });
    const pages = [
      { data: Array.from({ length: 100 }, (_, i) => ({ id: i })), meta: {} },
      { data: Array.from({ length: 30 }, (_, i) => ({ id: 100 + i })), meta: {} }
    ];
    let call = 0;
    api.getTests = async () => pages[call++];

    const all = await api.getAllTests(100);
    assert.strictEqual(all.length, 130);
    assert.strictEqual(call, 2, 'should stop after the short second page');
  });

  it('getTestStatistics buckets by success / state and os', async function () {
    const api = newClient({ api_key: 'k', api_secret: 's' });
    const now = new Date().toISOString();
    api.getAllTests = async () => [
      { created_at: now, success: true, browser: 'chrome', os: 'WIN10', duration: 10 },
      { created_at: now, success: false, browser: 'chrome', os: 'WIN10', duration: 20 },
      { created_at: now, state: 'RUNNING', browser: 'firefox', platform_name: 'iOS' },
      { created_at: now, state: 'TIMEOUT', browser: 'firefox', os: 'LINUX' }
    ];

    const s = await api.getTestStatistics(7);
    assert.strictEqual(s.total, 4);
    assert.strictEqual(s.passed, 1);
    assert.strictEqual(s.failed, 1);
    assert.strictEqual(s.running, 1);
    assert.strictEqual(s.error, 1);
    assert.strictEqual(s.byBrowser.chrome, 2);
    assert.strictEqual(s.byPlatform.WIN10, 2);
    assert.strictEqual(s.byPlatform.iOS, 1);
    assert.strictEqual(s.averageDuration, 8); // round((10+20)/4) = round(7.5)
  });

  it('waitForTestCompletion returns once the state is terminal', async function () {
    const api = newClient({ api_key: 'k', api_secret: 's' });
    const states = ['RUNNING', 'RUNNING', 'COMPLETE'];
    let i = 0;
    api.getTestDetails = async () => ({ state: states[i++], success: true });

    const test = await api.waitForTestCompletion('abc', 5000, 1);
    assert.strictEqual(test.state, 'COMPLETE');
  });

  it('waitForTestCompletion times out and throws when never terminal', async function () {
    const api = newClient({ api_key: 'k', api_secret: 's' });
    api.getTestDetails = async () => ({ state: 'RUNNING' });

    await assert.rejects(() => api.waitForTestCompletion('abc', 30, 5), /did not complete/);
  });

  it('smartCleanup keeps recent + failed and deletes the rest', async function () {
    const api = newClient({ api_key: 'k', api_secret: 's' });
    const old = new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString();
    const recent = new Date().toISOString();
    api.getAllTests = async () => [
      { session_id: 'recent', created_at: recent, success: true },
      { session_id: 'old-failed', created_at: old, success: false },
      { session_id: 'old-passed', created_at: old, success: true }
    ];
    const deleted = [];
    api.deleteTest = async (id) => { deleted.push(id); };

    const res = await api.smartCleanup({ keepDays: 30, keepFailed: true, keepMax: 0 });
    assert.deepStrictEqual(deleted, ['old-passed']);
    assert.strictEqual(res.deleted, 1);
    assert.strictEqual(res.analyzed, 3);
  });

  it('batchGetTestDetails separates successes from failures', async function () {
    const api = newClient({ api_key: 'k', api_secret: 's' });
    api.getTestDetails = async (id) => {
      if (id === 'bad') throw new Error('nope');
      return { id };
    };

    const res = await api.batchGetTestDetails(['a', 'bad', 'b']);
    assert.strictEqual(res.results.length, 2);
    assert.strictEqual(res.errors.length, 1);
    assert.strictEqual(res.errors[0].sessionId, 'bad');
  });
});
