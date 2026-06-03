'use strict';

const { TestingBotError } = require('./errors');

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Promise-based conveniences built on the resource methods. Mixed onto the
// TestingBot prototype, so `this` is the client instance.
module.exports = {
  // Fetch every test for the account, paging automatically.
  async getAllTests (batchSize = 100) {
    const allTests = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const page = await this.getTests(offset, batchSize);
      const tests = (page && page.data) || [];
      allTests.push(...tests);

      if (tests.length < batchSize) {
        hasMore = false;
      } else {
        offset += batchSize;
      }
    }

    return allTests;
  },

  // Poll a test until it reaches a terminal state (or the timeout elapses).
  async waitForTestCompletion (sessionId, timeout = 300000, pollInterval = 5000) {
    const startTime = Date.now();
    const busyStates = ['START', 'RUNNING', 'INIT', 'QUEUED'];

    while (Date.now() - startTime < timeout) {
      const test = await this.getTestDetails(sessionId);

      // The API exposes `state` (e.g. RUNNING, COMPLETE, TIMEOUT). Anything
      // that is not an in-progress state is terminal; pass/fail is available
      // via `success` / `status_id`.
      if (test.state && !busyStates.includes(test.state)) {
        return test;
      }

      await sleep(pollInterval);
    }

    throw new TestingBotError(`Test ${sessionId} did not complete within ${timeout}ms`);
  },

  async runTestAndWait (options, timeout = 300000) {
    const session = await this.createSession(options);
    return this.waitForTestCompletion(session.session_id, timeout);
  },

  // Fetch details for many tests, collecting successes and failures separately.
  async batchGetTestDetails (sessionIds) {
    const results = [];
    const errors = [];

    for (const sessionId of sessionIds) {
      try {
        const details = await this.getTestDetails(sessionId);
        results.push({ sessionId, details, success: true });
      } catch (error) {
        errors.push({ sessionId, error: error.message, success: false });
      }
    }

    return { results, errors };
  },

  // Aggregate pass/fail/state and browser/platform counts over recent tests.
  async getTestStatistics (days = 7) {
    const tests = await this.getAllTests();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentTests = tests.filter(test => new Date(test.created_at) >= cutoffDate);

    const stats = {
      total: recentTests.length,
      passed: 0,
      failed: 0,
      error: 0,
      running: 0,
      byBrowser: {},
      byPlatform: {},
      averageDuration: 0
    };

    let totalDuration = 0;

    for (const test of recentTests) {
      if (test.success === true) stats.passed++;
      else if (test.success === false) stats.failed++;
      else if (test.state === 'RUNNING' || test.state === 'START') stats.running++;
      else stats.error++;

      const browser = test.browser || 'unknown';
      stats.byBrowser[browser] = (stats.byBrowser[browser] || 0) + 1;

      const platform = test.os || test.platform_name || 'unknown';
      stats.byPlatform[platform] = (stats.byPlatform[platform] || 0) + 1;

      if (test.duration) {
        totalDuration += test.duration;
      }
    }

    stats.averageDuration = stats.total > 0
      ? Math.round(totalDuration / stats.total)
      : 0;

    return stats;
  },

  // Delete tests older than `daysOld`. Destructive.
  async cleanupOldTests (daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const tests = await this.getAllTests();
    const deleted = [];
    const errors = [];

    for (const test of tests) {
      if (new Date(test.created_at) < cutoffDate) {
        try {
          await this.deleteTest(test.session_id);
          deleted.push(test.session_id);
        } catch (error) {
          errors.push({ sessionId: test.session_id, error: error.message });
        }
      }
    }

    return { deleted, errors, total: deleted.length };
  },

  // Delete old tests while keeping recent / failed / up to `keepMax`. Destructive.
  async smartCleanup (options = {}) {
    const config = { keepDays: 30, keepFailed: true, keepMax: 1000, ...options };

    const tests = await this.getAllTests();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - config.keepDays);

    tests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const toDelete = [];
    let kept = 0;

    for (const test of tests) {
      const testDate = new Date(test.created_at);

      if (testDate >= cutoffDate) { kept++; continue; }
      if (config.keepFailed && test.success === false) { kept++; continue; }
      if (kept < config.keepMax) { kept++; continue; }

      toDelete.push(test.session_id);
    }

    const deleted = [];
    const errors = [];

    for (const sessionId of toDelete) {
      try {
        await this.deleteTest(sessionId);
        deleted.push(sessionId);
      } catch (error) {
        errors.push({ sessionId, error: error.message });
      }
    }

    return {
      analyzed: tests.length,
      kept,
      deleted: deleted.length,
      errors: errors.length,
      details: { deleted, errors }
    };
  },

  // Upload several files, collecting successes and failures separately.
  async uploadFiles (filePaths) {
    const results = [];
    const errors = [];

    for (const filePath of filePaths) {
      try {
        const url = await this.uploadFile(filePath);
        results.push({ filePath, url, success: true });
      } catch (error) {
        errors.push({ filePath, error: error.message, success: false });
      }
    }

    return { results, errors };
  },

  // Take screenshots for many URLs with the same browser set.
  async takeMultipleScreenshots (urls, browsers, resolution, options = {}) {
    const results = [];

    for (const url of urls) {
      try {
        const screenshot = await this.takeScreenshot(
          url,
          browsers,
          resolution,
          options.waitTime,
          options.fullPage,
          options.callbackURL
        );
        results.push({ url, screenshot, success: true });
      } catch (error) {
        results.push({ url, error: error.message, success: false });
      }
    }

    return results;
  }
};
