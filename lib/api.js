'use strict';

// Assembles the TestingBot client: the core (constructor + request plumbing)
// plus one mixin object per resource domain and the workflow helpers, all
// merged onto a single prototype so the public API stays flat (tb.getTests(),
// tb.getDevice(), ...). The error classes are attached to the export.

const TestingBot = require('./core');
const errors = require('./errors');

Object.assign(
  TestingBot.prototype,
  require('./resources/configuration'),
  require('./resources/devices'),
  require('./resources/browsers'),
  require('./resources/tests'),
  require('./resources/builds'),
  require('./resources/storage'),
  require('./resources/screenshots'),
  require('./resources/tunnels'),
  require('./resources/team'),
  require('./resources/user'),
  require('./resources/codeless'),
  require('./resources/session'),
  require('./workflows')
);

module.exports = TestingBot;
module.exports.TestingBot = TestingBot;
module.exports.errors = errors;
Object.assign(module.exports, errors);
