'use strict';

module.exports = {
  // getDevices(callback) — or getDevices({ platform }, callback) to filter by
  // OS family (Android, iOS, REAL_ANDROID, REAL_IOS).
  getDevices (options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    const data = {};
    if (options && options.platform != null) {
      data.platform = options.platform;
    }
    return this.request({
      method: 'GET',
      url: '/devices',
      data
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
