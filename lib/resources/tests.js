'use strict';

module.exports = {
  getTests (offset, limit, callback) {
    if (offset == null) {
      offset = 0;
    }
    if (limit == null) {
      limit = 10;
    }

    return this.request({
      method: 'GET',
      url: '/tests/',
      data: { offset, count: limit }
    }, callback);
  },

  getTestDetails (testID, callback) {
    if (!testID) {
      throw new Error('Test ID is required');
    }
    return this.request({
      method: 'GET',
      url: '/tests/' + testID
    }, callback);
  },

  updateTest (data, testID, callback) {
    if (!testID) {
      throw new Error('Test ID is required');
    }
    return this.request({
      method: 'PUT',
      url: '/tests/' + testID,
      data
    }, callback);
  },

  deleteTest (testID, callback) {
    if (!testID) {
      throw new Error('Test ID is required');
    }
    return this.request({
      method: 'DELETE',
      url: '/tests/' + testID
    }, callback);
  },

  stopTest (testID, callback) {
    if (!testID) {
      throw new Error('Test ID is required');
    }
    return this.request({
      method: 'PUT',
      url: '/tests/' + testID + '/stop'
    }, callback);
  }
};
