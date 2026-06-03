'use strict';

const {
  TestingBotError,
  AuthenticationError,
  RateLimitError,
  ValidationError
} = require('./errors');

function extractMessage (body, status) {
  if (typeof body === 'string' && body.length > 0) {
    return body;
  }
  if (body && typeof body === 'object') {
    return body.message || body.error || JSON.stringify(body);
  }
  return 'TestingBot API request failed with status code ' + status;
}

// Map an HTTP error response onto a typed Error that still carries the
// status code and the raw response body.
function buildHttpError (status, body, headers) {
  const message = extractMessage(body, status);
  let error;
  switch (status) {
    case 400:
      error = new ValidationError(message, (body && body.fields) || []);
      break;
    case 401:
      error = new AuthenticationError(message);
      break;
    case 429:
      error = new RateLimitError(message, headers && headers['retry-after']);
      break;
    default:
      error = new TestingBotError(message, status, body);
      break;
  }
  error.statusCode = status;
  error.response = body;
  return error;
}

module.exports = { buildHttpError, extractMessage };
