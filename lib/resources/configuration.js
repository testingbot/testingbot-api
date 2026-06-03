'use strict';

module.exports = {
  // Returns the list of TestingBot IPv4 addresses (for firewall allow-lists).
  // Responds with a bare array of strings; no envelope.
  getIpRanges (callback) {
    return this.request({
      method: 'GET',
      url: '/configuration/ip-ranges'
    }, callback);
  }
};
