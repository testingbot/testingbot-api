'use strict';

module.exports = {
  // getTests(offset, limit, callback) — or getTests(options, callback) where
  // options may carry { offset, count/limit, since, group, build, browser_id,
  // skip_fields }.
  getTests (offset, limit, callback) {
    let data;
    if (offset !== null && typeof offset === 'object') {
      const opts = offset;
      callback = limit;
      data = {
        offset: opts.offset != null ? opts.offset : 0,
        count: opts.count != null ? opts.count : (opts.limit != null ? opts.limit : 10)
      };
      ['since', 'group', 'build', 'browser_id', 'skip_fields'].forEach((key) => {
        if (opts[key] != null) {
          data[key] = opts[key];
        }
      });
    } else {
      if (offset == null) {
        offset = 0;
      }
      if (limit == null) {
        limit = 10;
      }
      data = { offset, count: limit };
    }

    return this.request({
      method: 'GET',
      url: '/tests/',
      data
    }, callback);
  },

  // getTestDetails(testID, callback) — or getTestDetails(testID, { skip_fields }, callback).
  getTestDetails (testID, options, callback) {
    if (!testID) {
      throw new Error('Test ID is required');
    }
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    const data = {};
    if (options && options.skip_fields != null) {
      data.skip_fields = options.skip_fields;
    }
    return this.request({
      method: 'GET',
      url: '/tests/' + testID,
      data
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
