'use strict';

module.exports = {
  getBuilds (offset, limit, callback) {
    if (offset == null) {
      offset = 0;
    }
    if (limit == null) {
      limit = 10;
    }

    return this.request({
      method: 'GET',
      url: '/builds',
      data: { offset, count: limit }
    }, callback);
  },

  getTestsForBuild (buildId, callback) {
    if (!buildId) {
      throw new Error('Build ID is required');
    }
    return this.request({
      method: 'GET',
      url: '/builds/' + buildId
    }, callback);
  },

  deleteBuild (buildId, callback) {
    if (!buildId) {
      throw new Error('Build ID is required');
    }
    return this.request({
      method: 'DELETE',
      url: '/builds/' + buildId
    }, callback);
  }
};
