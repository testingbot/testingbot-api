'use strict';

module.exports = {
  getDevices (callback) {
    return this.request({
      method: 'GET',
      url: '/devices',
      data: {}
    }, callback);
  },

  getAvailableDevices (callback) {
    return this.request({
      method: 'GET',
      url: '/devices/available',
      data: {}
    }, callback);
  },

  getDevice (deviceId, callback) {
    if (!deviceId) {
      throw new Error('Device ID is required');
    }
    return this.request({
      method: 'GET',
      url: '/devices/' + encodeURIComponent(deviceId)
    }, callback);
  }
};
