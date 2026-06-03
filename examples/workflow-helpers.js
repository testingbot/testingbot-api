#!/usr/bin/env node
'use strict';

const TestingBot = require('../index.js');
const { AuthenticationError } = TestingBot;

/**
 * Example: workflow helpers + typed errors on the TestingBot client.
 *
 * The retry / rate-limit / logging behaviours from the old EnhancedTestingBot
 * are intentionally not part of the client; wrap calls yourself if you need them.
 */
async function main () {
  const tb = new TestingBot({
    api_key: process.env.TB_KEY,
    api_secret: process.env.TB_SECRET
  });

  try {
    console.log('\n========== Workflow Helpers Demo ==========\n');

    // 1. Test statistics over the last 7 days
    console.log('1. Getting test statistics for the last 7 days...');
    const stats = await tb.getTestStatistics(7);
    console.log(`  Total: ${stats.total}, passed: ${stats.passed}, failed: ${stats.failed}`);
    console.log(`  Average duration: ${stats.averageDuration}ms`);
    console.log('  By browser:', stats.byBrowser);
    console.log('  By platform:', stats.byPlatform);
    console.log();

    // 2. Batch fetch test details (list endpoints return { data, meta })
    console.log('2. Batch operations...');
    const recent = await tb.getTests(0, 3);
    const sessionIds = (recent.data || []).map(test => test.id || test.session_id);
    if (sessionIds.length > 0) {
      const batch = await tb.batchGetTestDetails(sessionIds);
      console.log(`  Fetched ${batch.results.length} tests (${batch.errors.length} errors)`);
    }
    console.log();

    // 3. Auto-paginate every test
    console.log('3. Fetching all tests with automatic pagination...');
    const allTests = await tb.getAllTests(50);
    console.log(`  Retrieved ${allTests.length} total tests\n`);

    // 4. Smart cleanup (keeps recent + failed tests)
    console.log('4. Smart cleanup...');
    const cleanup = await tb.smartCleanup({ keepDays: 30, keepFailed: true, keepMax: 100 });
    console.log(`  Analyzed ${cleanup.analyzed}, kept ${cleanup.kept}, deleted ${cleanup.deleted}\n`);

    // 5. Typed error handling
    console.log('5. Typed error handling...');
    try {
      await tb.getTestDetails('invalid-session-id');
    } catch (error) {
      console.log(`  ${error.name} (status ${error.statusCode}): ${error.message}`);
    }
    console.log();

    // 6. Screenshots across multiple URLs
    console.log('6. Taking screenshots of multiple URLs...');
    const browsers = [{ browserName: 'chrome', version: 'latest', os: 'WIN10' }];
    const shots = await tb.takeMultipleScreenshots(
      ['https://testingbot.com', 'https://testingbot.com/features'],
      browsers,
      '1920x1080',
      { waitTime: 3, fullPage: false }
    );
    console.log(`  ${shots.filter(r => r.success).length}/${shots.length} succeeded\n`);

    console.log('========== Demo Complete ==========\n');
  } catch (error) {
    console.error('Error in demo:', error.message);
    if (error instanceof AuthenticationError) {
      console.log('\nPlease set TB_KEY and TB_SECRET environment variables.');
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
