'use strict';

module.exports = {
  takeScreenshot (url, browsers, resolution, waitTime, fullPage, callbackURL, callback) {
    const data = {};
    if (!url) {
      throw new Error('URL is required');
    }
    if (!browsers || !Array.isArray(browsers) || browsers.length === 0) {
      throw new Error('At least one browser configuration is required');
    }
    if (!resolution) {
      throw new Error('Resolution is required');
    }
    data.url = url;
    data.browsers = browsers;
    data.resolution = resolution;
    if (waitTime) {
      data.wait_time = waitTime;
    }
    if (fullPage) {
      data.fullpage = fullPage;
    }
    if (callbackURL) {
      data.callback_url = callbackURL;
    }

    return this.requestJson({
      method: 'POST',
      url: '/screenshots',
      data
    }, callback);
  },

  // retrieveScreenshots(id, callback) — or retrieveScreenshots(id, { excludeIds }, callback).
  retrieveScreenshots (screenshotId, options, callback) {
    if (!screenshotId) {
      throw new Error('Screenshot ID is required');
    }
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    const data = {};
    if (options && options.excludeIds != null) {
      data.excludeIds = options.excludeIds;
    }
    return this.request({
      method: 'GET',
      url: '/screenshots/' + screenshotId,
      data
    }, callback);
  },

  getScreenshotList (offset, limit, callback) {
    if (offset == null) {
      offset = 0;
    }
    if (limit == null) {
      limit = 10;
    }

    return this.request({
      method: 'GET',
      url: '/screenshots',
      data: { offset, count: limit }
    }, callback);
  }
};
