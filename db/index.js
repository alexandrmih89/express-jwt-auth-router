'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _db = require('./db');

var _db2 = _interopRequireDefault(_db);

require('./User/UserScopes');

require('./associations');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _db2.default;