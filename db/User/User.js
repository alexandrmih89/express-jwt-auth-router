'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _sequelize = require('sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

var _db = require('../db');

var _db2 = _interopRequireDefault(_db);

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var User = _db2.default.define('user', {
  username: {
    type: _sequelize2.default.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  password: {
    type: _sequelize2.default.STRING
  }
}, {
  paranoid: true,
  hooks: {
    beforeValidate: function beforeValidate(user) {
      if (user.password) {
        user.password = _bcrypt2.default.hashSync(user.password, 10);
      }
    }
  }
});
//TODO: replace bcrypt with argon2? or increment bcrypt complexity
exports.default = User;