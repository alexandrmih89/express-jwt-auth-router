'use strict';

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var envPath = '.env.' + process.env.NODE_ENV;

_fs2.default.existsSync(envPath) ? _dotenv2.default.config({ path: envPath }) : _dotenv2.default.config();