'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _sequelize = require('sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

var _db = require('../db');

var _db2 = _interopRequireDefault(_db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UserProvider = _db2.default.define('user_provider', {
  //TODO: composite PK???
  identifier: {
    type: _sequelize2.default.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  provider: {
    type: _sequelize2.default.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  }
});

exports.default = UserProvider;