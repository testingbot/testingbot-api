'use strict';

const assert = require('assert');
const { newClient } = require('../support/client');

describe('Test Management', function () {
  beforeEach(function () {
    this.api = newClient();
  });

  it('should list tests with default pagination', function (done) {
    this.api.getTests(undefined, undefined, function (err, response) {
      assert.strictEqual(err, null, 'Should not have an error');
      assert.ok(response, 'Response should exist');
      assert.ok(Array.isArray(response.data), 'Response data should be an array');
      assert.ok(response.data.length >= 0, 'Data array should exist');
      done();
    });
  });

  it('should list tests with custom pagination', function (done) {
    this.api.getTests(0, 5, function (err, response) {
      assert.strictEqual(err, null, 'Should not have an error');
      assert.ok(response, 'Response should exist');
      assert.ok(response.meta, 'Meta information should exist');
      done();
    });
  });

  it('should error when no test is found', function (done) {
    this.api.getTestDetails(324234234324, function (err, response) {
      assert.strictEqual(response, null, 'Response should be null for non-existent test');
      assert.notStrictEqual(err, null, 'Should have an error for non-existent test');
      done();
    });
  });

  it('should find a specific test', function (done) {
    this.api.getTests(undefined, undefined, (err, response) => {
      assert.ok(response && response.data && response.data.length > 0, 'Should have test data');
      const singleTest = response.data[0];
      this.api.getTestDetails(singleTest.id, (err, response) => {
        assert.strictEqual(err, null, 'Should not have an error');
        assert.notStrictEqual(response, null, 'Response should not be null');
        assert.strictEqual(response.id, singleTest.id, 'Test ID should match');
        done();
      });
    });
  });

  it('should update a test with legacy data format', function (done) {
    this.api.getTests(undefined, undefined, (err, response) => {
      assert.ok(response && response.data && response.data.length > 0, 'Should have test data');
      const singleTest = response.data[0];
      const statusMessage = 'test_' + Date.now();
      const payload = { 'test[success]': '1', 'test[status_message]': statusMessage };
      this.api.updateTest(payload, singleTest.id, (err) => {
        assert.strictEqual(err, null, 'Should not have an error updating test');
        this.api.getTestDetails(singleTest.id, (err, response) => {
          assert.strictEqual(err, null, 'Should not have an error getting test details');
          assert.strictEqual(response.status_message, statusMessage, 'Status message should be updated');
          done();
        });
      });
    });
  });

  it('should update a test with object data format', function (done) {
    this.api.getTests(undefined, undefined, (err, response) => {
      assert.ok(response && response.data && response.data.length > 0, 'Should have test data');
      const singleTest = response.data[0];
      const statusMessage = 'test2_' + Date.now();
      const payload = { test: { success: 1, status_message: statusMessage } };
      this.api.updateTest(payload, singleTest.id, (err) => {
        assert.strictEqual(err, null, 'Should not have an error updating test');
        this.api.getTestDetails(singleTest.id, (err, response) => {
          assert.strictEqual(err, null, 'Should not have an error getting test details');
          assert.strictEqual(response.status_message, statusMessage, 'Status message should be updated');
          done();
        });
      });
    });
  });

  it('should stop a test', function (done) {
    this.api.getTests(undefined, undefined, (err, response) => {
      if (!response || !response.data || response.data.length === 0) {
        return done();
      }
      const testToStop = response.data.find((test) => test.status === 'running');

      if (!testToStop) {
        return done();
      }

      this.api.stopTest(testToStop.id, (err, response) => {
        assert.strictEqual(err, null, 'Should not have an error stopping test');
        done();
      });
    });
  });

  it('should delete a test', function (done) {
    this.api.getTests(undefined, undefined, (err, response) => {
      assert.ok(response && response.data && response.data.length > 0, 'Should have test data');
      const singleTest = response.data[0];
      this.api.deleteTest(singleTest.id, (err, response) => {
        assert.strictEqual(err, null, 'Should not have an error deleting test');
        this.api.getTestDetails(singleTest.id, (err, response) => {
          assert.strictEqual(response, null, 'Response should be null after deletion');
          assert.notStrictEqual(err, null, 'Should have an error for deleted test');
          done();
        });
      });
    });
  });
});
