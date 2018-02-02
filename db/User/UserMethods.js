'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _httpErrors = require('http-errors');

var _httpErrors2 = _interopRequireDefault(_httpErrors);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _User = require('./User');

var _User2 = _interopRequireDefault(_User);

var _Role = require('../Role/Role');

var _Role2 = _interopRequireDefault(_Role);

var _Contact = require('../Contact/Contact');

var _Contact2 = _interopRequireDefault(_Contact);

var _UserProvider = require('../UserProvider/UserProvider');

var _UserProvider2 = _interopRequireDefault(_UserProvider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var userRoles = 'user';
var facebookRole = 'user';

var PasswordIncorrect = function PasswordIncorrect() {
  return _httpErrors2.default.Unauthorized("Password Incorrect");
};
var UserNotFound = function UserNotFound() {
  return _httpErrors2.default.NotFound("User not found");
};
var AlreadyTaken = function AlreadyTaken() {
  return _httpErrors2.default.Forbidden("Username is already taken");
};
var EmailNotPresent = function EmailNotPresent() {
  return _httpErrors2.default.BadRequest("No email present");
};

_User2.default.findByUsername = function (username) {
  return _User2.default.findOne({ where: { username: username } });
};

_User2.default.login = function (reqUser) {
  return _User2.default.findByUsername(reqUser.username).then(function (user) {
    if (!user) {
      throw UserNotFound();
    }
    user.validatePassword(reqUser.password);
    return user;
  });
};

_User2.default.register = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(reqUser) {
    var user, roles, newUser;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _User2.default.findByUsername(reqUser.username);

          case 2:
            user = _context.sent;

            if (!user) {
              _context.next = 5;
              break;
            }

            throw AlreadyTaken();

          case 5:
            if (reqUser.email) {
              _context.next = 7;
              break;
            }

            throw EmailNotPresent();

          case 7:
            roles = _lodash2.default.isArray(userRoles) ? userRoles : [userRoles];
            _context.next = 10;
            return _User2.default.create(_extends({}, reqUser, {
              roles: roles.map(function (role) {
                return { role: role };
              }),
              contacts: [{ kind: 'email', contact: reqUser.email }]
            }), {
              include: [, /*{
                          model: Role, as: 'roles'
                          }*/{
                model: _Contact2.default, as: 'contacts'
              }]
            });

          case 10:
            newUser = _context.sent;
            _context.next = 13;
            return newUser.setRoles(roles.map(function (role) {
              return { role: role };
            }));

          case 13:
            return _context.abrupt('return', _User2.default.findById(newUser.id));

          case 14:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

_User2.default.facebookQuery = function (fbProfile) {
  return _User2.default.findOne({
    include: [{
      model: _UserProvider2.default,
      as: 'authProviders',
      required: true,
      where: {
        identifier: fbProfile.id
      }
    }]
  });
};

_User2.default.facebookCreate = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(fbProfile) {
    var user;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return _User2.default.create({
              username: fbProfile.email || fbProfile.emails[0]
            });

          case 2:
            user = _context2.sent;
            _context2.next = 5;
            return _UserProvider2.default.create({ identifier: fbProfile.id, provider: 'facebook' }).then(function (authProvider) {
              return user.addAuthProvider(authProvider);
            });

          case 5:
            _context2.next = 7;
            return _lodash2.default.isArray(facebookRole) ? user.addRole(facebookRole) : user.addRoles(facebookRole);

          case 7:
            return _context2.abrupt('return', _User2.default.findById(user.id));

          case 8:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function (_x2) {
    return _ref2.apply(this, arguments);
  };
}();

_User2.default.prototype.validatePassword = function (password) {
  if (!_bcrypt2.default.compareSync(password, this.password)) {
    throw PasswordIncorrect();
  }
};

_User2.default.prototype.toJSON = function () {
  var user = this.get();
  return _extends({}, user, {
    //TODO: optimize query?
    roles: user.roles.map(function (_ref3) {
      var role = _ref3.role;
      return role;
    }),
    emails: user.emails.map(function (_ref4) {
      var contact = _ref4.contact;
      return contact;
    }),
    password: undefined,
    authProviders: undefined
  });
};