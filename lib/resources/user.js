'use strict';

module.exports = {
  getUserInfo (callback) {
    return this.request({
      method: 'GET',
      url: '/user'
    }, callback);
  },

  // Returns the account's API key and secret: { key, secret }.
  getUserKeys (callback) {
    return this.request({
      method: 'GET',
      url: '/user/keys'
    }, callback);
  },

  updateUserInfo (data, callback) {
    if (!data) {
      throw new Error('Data is required');
    }
    // The API expects the fields wrapped in a `user` object (only
    // first_name / last_name are mutable). Avoid double-wrapping if the
    // caller already passed { user: ... }.
    const userData = data.user ? data : { user: data };
    return this.request({
      method: 'PUT',
      url: '/user',
      data: userData
    }, callback);
  }
};
