'use strict';

module.exports = {
  getTeam (callback) {
    return this.request({
      method: 'GET',
      url: '/team-management'
    }, callback);
  },

  getUsersInTeam (callback) {
    return this.request({
      method: 'GET',
      url: '/team-management/users'
    }, callback);
  },

  getUserFromTeam (userId, callback) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.request({
      method: 'GET',
      url: '/team-management/users/' + userId
    }, callback);
  },

  createUserInTeam (user, callback) {
    if (!user) {
      throw new Error('User object is required');
    }
    return this.request({
      method: 'POST',
      url: '/team-management/users/',
      data: user
    }, callback);
  },

  updateUserInTeam (userId, userData, callback) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.request({
      method: 'PUT',
      url: '/team-management/users/' + userId,
      data: userData
    }, callback);
  },

  resetCredentials (userId, callback) {
    return this.request({
      method: 'POST',
      url: '/team-management/users/' + userId + '/reset-keys'
    }, callback);
  }
};
