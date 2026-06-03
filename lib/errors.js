'use strict';

class TestingBotError extends Error {
  constructor (message, statusCode, response) {
    super(message);
    this.name = 'TestingBotError';
    this.statusCode = statusCode;
    this.response = response;
    Error.captureStackTrace(this, this.constructor);
  }
}

class AuthenticationError extends TestingBotError {
  constructor (message = 'Authentication failed. Please check your API key and secret.') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

class RateLimitError extends TestingBotError {
  constructor (message = 'Rate limit exceeded. Please try again later.', retryAfter = null) {
    super(message, 429);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

class ValidationError extends TestingBotError {
  constructor (message, fields = []) {
    super(message, 400);
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

class NotFoundError extends TestingBotError {
  constructor (resource, id) {
    const message = id ? `${resource} with ID '${id}' not found` : `${resource} not found`;
    super(message, 404);
    this.name = 'NotFoundError';
    this.resource = resource;
    this.id = id;
  }
}

class NetworkError extends TestingBotError {
  constructor (message = 'Network error occurred', originalError = null) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

module.exports = {
  TestingBotError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NotFoundError,
  NetworkError
};
