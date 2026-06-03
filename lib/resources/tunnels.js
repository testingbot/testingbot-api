'use strict';

module.exports = {
  getTunnel (callback) {
    return this.request({
      method: 'GET',
      url: '/tunnel'
    }, callback);
  },

  getTunnelList (callback) {
    return this.request({
      method: 'GET',
      url: '/tunnel/list'
    }, callback);
  },

  getTunnelById (tunnelId, callback) {
    if (!tunnelId) {
      throw new Error('Tunnel ID is required');
    }
    return this.request({
      method: 'GET',
      url: '/tunnel/' + tunnelId
    }, callback);
  },

  deleteTunnel (tunnelId, callback) {
    if (!tunnelId) {
      throw new Error('Tunnel ID is required');
    }
    return this.request({
      method: 'DELETE',
      url: '/tunnel/' + tunnelId
    }, callback);
  },

  // Tear down whichever tunnel is currently active (no ID needed).
  deleteActiveTunnel (callback) {
    return this.request({
      method: 'DELETE',
      url: '/tunnel'
    }, callback);
  }
};
