'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _sequelize = require('sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

var _db = require('../db');

var _db2 = _interopRequireDefault(_db);

var _Permission = require('../Permission/Permission');

var _Permission2 = _interopRequireDefault(_Permission);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Role = _db2.default.define('role', {
  role: {
    type: _sequelize2.default.STRING,
    primaryKey: true,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  }
}, { paranoid: true });

exports.default = Role;