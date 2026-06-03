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

  deleteTunnel (tunnelId, callback) {
    if (!tunnelId) {
      throw new Error('Tunnel ID is required');
    }
    return this.request({
      method: 'DELETE',
      url: '/tunnel/' + tunnelId
    }, callback);
  }
};
