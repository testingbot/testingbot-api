'use strict';

const assert = require('assert');
const { buildHttpError, extractMessage } = require('../lib/http-error');
const TestingBot = require('../index.js');

const {
  TestingBotError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NotFoundError,
  NetworkError
} = TestingBot;

// These are pure unit tests — no network or credentials required.
describe('Typed errors', function () {
  describe('error classes (exported from the package root)', function () {
    it('exposes the full hierarchy', function () {
      assert.strictEqual(typeof TestingBotError, 'function');
      assert.ok(new AuthenticationError('x') instanceof TestingBotError);
      assert.ok(new RateLimitError('x') instanceof TestingBotError);
      assert.ok(new ValidationError('x') instanceof TestingBotError);
      assert.ok(new NotFoundError('Test', 1) instanceof TestingBotError);
      assert.ok(new NetworkError('x') instanceof TestingBotError);
    });

    it('every instance is also a real Error', function () {
      assert.ok(new TestingBotError('x') instanceof Error);
      assert.ok(new AuthenticationError('x') instanceof Error);
    });

    it('AuthenticationError defaults to status 401', function () {
      assert.strictEqual(new AuthenticationError('x').statusCode, 401);
    });
  });

  describe('buildHttpError mapping', function () {
    it('maps 401 to AuthenticationError, preserving message + body', function () {
      const e = buildHttpError(401, 'nope');
      assert.ok(e instanceof AuthenticationError);
      assert.strictEqual(e.statusCode, 401);
      assert.strictEqual(e.message, 'nope');
      assert.strictEqual(e.response, 'nope');
    });

    it('maps 400 to ValidationError carrying fields', function () {
      const e = buildHttpError(400, { message: 'bad', fields: ['email'] });
      assert.ok(e instanceof ValidationError);
      assert.deepStrictEqual(e.fields, ['email']);
      assert.strictEqual(e.message, 'bad');
    });

    it('maps 429 to RateLimitError with the retry-after header', function () {
      const e = buildHttpError(429, 'slow down', { 'retry-after': '30' });
      assert.ok(e instanceof RateLimitError);
      assert.strictEqual(e.retryAfter, '30');
    });

    it('maps other statuses to TestingBotError, keeping status + body', function () {
      const body = { error: 'boom' };
      const e = buildHttpError(500, body);
      assert.ok(e instanceof TestingBotError);
      assert.strictEqual(e.statusCode, 500);
      assert.strictEqual(e.message, 'boom');
      assert.strictEqual(e.response, body);
    });
  });

  describe('extractMessage', function () {
    it('prefers a string body', function () {
      assert.strictEqual(extractMessage('plain', 500), 'plain');
    });

    it('reads message then error from object bodies', function () {
      assert.strictEqual(extractMessage({ message: 'm' }, 500), 'm');
      assert.strictEqual(extractMessage({ error: 'e' }, 500), 'e');
    });

    it('falls back to a status-based message', function () {
      assert.strictEqual(
        extractMessage(undefined, 503),
        'TestingBot API request failed with status code 503'
      );
    });
  });
});
