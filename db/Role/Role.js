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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

Role.addRolesToUser = function () {
  var roles = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var user = arguments[1];

  return Role.findAll({
    where: {
      role: _defineProperty({}, _sequelize2.default.Op.in, roles)
    }
  }).then(function (roles) {
    return user.addRoles(roles);
  });
};

exports.default = Role;