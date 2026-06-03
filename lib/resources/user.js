'use strict';

module.exports = {
  getUserInfo (callback) {
    return this.request({
      method: 'GET',
      url: '/user'
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
