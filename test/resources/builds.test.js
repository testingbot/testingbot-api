'use strict';

const assert = require('assert');
const { newClient } = require('../support/client');

describe('Build Management', function () {
  beforeEach(function () {
    this.api = newClient();
  });

  it('should list builds', function (done) {
    this.api.getBuilds(undefined, undefined, function (err, response) {
      assert.strictEqual(err, null, 'Should not have an error');
      assert.ok(response, 'Response should exist');
      done();
    });
  });

  it('should list builds with pagination', function (done) {
    this.api.getBuilds(0, 5, function (err, response) {
      assert.strictEqual(err, null, 'Should not have an error');
      assert.ok(response, 'Response should exist');
      done();
    });
  });

  it('should get tests for a build', function (done) {
    this.api.getBuilds(undefined, undefined, (err, response) => {
      const builds = (response && response.data) || response || [];
      if (builds.length > 0) {
        const buildId = builds[0].id || builds[0].build_id;
        this.api.getTestsForBuild(buildId, (err, testsResponse) => {
          assert.strictEqual(err, null, 'Should not have an error getting tests for build');
          assert.ok(testsResponse, 'Tests response should exist');
          done();
        });
      } else {
        done();
      }
    });
  });

  it('should delete a build', function (done) {
    this.api.getBuilds(undefined, undefined, (err, response) => {
      const builds = (response && response.data) || response || [];
      if (builds.length > 0) {
        const buildId = builds[0].id || builds[0].build_id;
        this.api.deleteBuild(buildId, (err, deleteResponse) => {
          assert.strictEqual(err, null, 'Should not have an error deleting build');
          done();
        });
      } else {
        done();
      }
    });
  });
});
