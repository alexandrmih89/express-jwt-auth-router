'use strict';

var _User = require('./User');

var _User2 = _interopRequireDefault(_User);

var _Role = require('./Role');

var _Role2 = _interopRequireDefault(_Role);

var _Permission = require('./Permission');

var _Permission2 = _interopRequireDefault(_Permission);

var _Contact = require('./Contact');

var _Contact2 = _interopRequireDefault(_Contact);

var _UserProvider = require('./UserProvider');

var _UserProvider2 = _interopRequireDefault(_UserProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_User2.default.hasMany(_Contact2.default);
_User2.default.hasMany(_Contact2.default, { as: 'emails' });
_User2.default.hasMany(_Contact2.default, { as: 'phones' });
_User2.default.hasMany(_UserProvider2.default, { as: 'authProviders' });
_User2.default.belongsToMany(_Role2.default, { as: 'roles', through: 'user_roles' });

_Role2.default.belongsToMany(_Role2.default, { as: 'parentRoles', through: 'role_parents' });
_Role2.default.belongsToMany(_Permission2.default, { as: 'permissions', through: 'roles_permissions' });