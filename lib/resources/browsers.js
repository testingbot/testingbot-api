'use strict';

module.exports = {
  getBrowsers (type, callback) {
    const data = {};
    if (type) {
      data.type = type;
    }

    return this.request({
      method: 'GET',
      url: '/browsers',
      data
    }, callback);
  }
};
