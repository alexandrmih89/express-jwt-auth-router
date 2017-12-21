'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _acl = require('acl');

var _acl2 = _interopRequireDefault(_acl);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _expressJwt = require('express-jwt');

var _expressJwt2 = _interopRequireDefault(_expressJwt);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _httpErrors = require('http-errors');

var _httpErrors2 = _interopRequireDefault(_httpErrors);

var _combine = require('./util/combine');

var _combine2 = _interopRequireDefault(_combine);

require('./util/dotenv');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var jwtSecret = process.env.JWT_SECRET;

var authenticateJWT = (0, _expressJwt2.default)({ secret: jwtSecret });
var adminRole = process.env.ADMIN_ROLE || 'admin';

var r = process.env.ACL_REDIS ? process.env.ACL_REDIS.split(',') : false;
var aclBackend = r ? new _acl2.default.redisBackend(r[0], r[1] || '') : new _acl2.default.memoryBackend();
var acl = new _acl2.default(aclBackend);

acl.isAuthorized = isAuthorized;
acl.isAuthenticated = (0, _combine2.default)([authenticateJWT, isAuthenticated]);
acl.signAccessToken = signAccessToken;
acl.signRefreshToken = signRefreshToken;
acl.isRefreshTokenValid = isRefreshTokenValid;

acl.canMiddleware = function (permission, when) {
  return (0, _combine2.default)([acl.isAuthenticated, isAuthorized(permission, when)]);
};

exports.default = acl;


function isAuthorized(permission) {
  var when = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (req, res) {
    return true;
  };

  return function (req, res, next) {

    var p = permission.split(":");

    var roles = req.user.roles;

    //TODO: should I use memory or redis here???

    acl.areAnyRolesAllowed(roles, p[0], p[1]).then(function (isAllowed) {
      if (isAllowed && when(req, res)) {
        next();
        return;
      }

      if (_lodash2.default.includes(roles, adminRole)) {
        next();
        return;
      }

      throw new _httpErrors2.default.Forbidden("Permission denied");
    }).catch(next);
  };
}

function isAuthenticated(req, res, next) {
  if (req.user.type !== 'access') {
    return next(_httpErrors2.default.Unauthorized("Invalid access token"));
  }
  //TODO: check if access token is blacklisted
  return next();
}

function isRefreshTokenValid(req, res, next) {
  authenticateJWT(req, res, function (err) {
    if (req.user && !req.user.exp && req.user.type === 'refresh') {
      //check if token expires, then reject, cause it's an accessToken
      //TODO: check if refresh token is blacklisted
      return next();
    } else {
      err = _httpErrors2.default.Unauthorized("Invalid refresh token");
    }
    return next(err);
  });
}

var signatureNotComplete = function signatureNotComplete() {
  return new _httpErrors2.default.BadRequest("Signature payload incomplete");
};

function signAccessToken(req) {
  return signToken(req, 'access', 300);
}

function signRefreshToken(req) {
  return signToken(req, 'refresh');
}

function signToken(req, type, expiresIn) {
  var _req$user = req.user,
      id = _req$user.id,
      provider = _req$user.provider,
      roles = _req$user.roles,
      device = _req$user.device;


  if (!id || !provider || !roles) {
    throw signatureNotComplete();
  }

  //TODO: api?
  return _jsonwebtoken2.default.sign({ id: id, provider: provider, roles: roles, device: device, type: type }, jwtSecret, expiresIn ? { expiresIn: expiresIn } : {});
}