'use strict';

module.exports = {
  getCodelessTests (offset, limit, callback) {
    if (offset == null) {
      offset = 0;
    }
    if (limit == null) {
      limit = 10;
    }

    return this.request({
      method: 'GET',
      url: '/lab',
      data: { offset, count: limit }
    }, callback);
  },

  createCodelessTest (testData, callback) {
    if (!testData || !testData.name || !testData.url) {
      throw new Error('Test name and URL are required');
    }

    const data = {};

    // Map test properties to the expected test[...] form fields.
    if (testData.name) data['test[name]'] = testData.name;
    if (testData.url) data['test[url]'] = testData.url;
    if (testData.cron) data['test[cron]'] = testData.cron;
    if (testData.screenshot !== undefined) data['test[screenshot]'] = testData.screenshot;
    if (testData.video !== undefined) data['test[video]'] = testData.video;
    if (testData.idletimeout) data['test[idletimeout]'] = testData.idletimeout;
    if (testData.screenresolution) data['test[screenresolution]'] = testData.screenresolution;
    if (testData.ai_prompt) data['test[ai_prompt]'] = testData.ai_prompt;

    return this.request({
      method: 'POST',
      url: '/lab',
      data
    }, callback);
  },

  updateCodelessTest (data, testID, callback) {
    if (!testID) {
      throw new Error('Test ID is required');
    }
    if (!data) {
      throw new Error('Data is required');
    }
    return this.request({
      method: 'PUT',
      url: '/lab/' + testID,
      data
    }, callback);
  },

  deleteCodelessTest (testID, callback) {
    if (!testID) {
      throw new Error('Test ID is required');
    }
    return this.request({
      method: 'DELETE',
      url: '/lab/' + testID
    }, callback);
  }
};
