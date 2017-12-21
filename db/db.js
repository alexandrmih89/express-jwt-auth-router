'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Sequelize = undefined;

var _sequelize = require('sequelize');

var _sequelize2 = _interopRequireDefault(_sequelize);

require('../util/dotenv');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var db = new _sequelize2.default(process.env.DB_URL);

exports.default = db;
exports.Sequelize = _sequelize2.default;