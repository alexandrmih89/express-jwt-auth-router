'use strict';

var _User = require('./User');

var _User2 = _interopRequireDefault(_User);

var _Role = require('../Role/Role');

var _Role2 = _interopRequireDefault(_Role);

var _Contact = require('../Contact/Contact');

var _Contact2 = _interopRequireDefault(_Contact);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_User2.default.addScope('defaultScope', {
  include: [{
    model: _Role2.default,
    as: 'roles'
  }, {
    model: _Contact2.default,
    as: 'contacts'
  }, {
    model: _Contact2.default,
    as: 'emails',
    where: {
      kind: 'email'
    },
    required: false
  }]
}, {
  override: true
});