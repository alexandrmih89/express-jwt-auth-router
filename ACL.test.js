'use strict';

var _httpErrors = require('http-errors');

var _httpErrors2 = _interopRequireDefault(_httpErrors);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _ACL = require('./ACL');

var _ACL2 = _interopRequireDefault(_ACL);

require('./util/dotenv');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var jwtSecret = process.env.JWT_SECRET;

var adminRole = process.env.ADMIN_ROLE || 'admin';
var userRole = 'user';

var user = { user: { id: 1, provider: 'password', roles: [userRole] } };
var admin = { user: { id: 2, provider: 'password', roles: [adminRole] } };
var userJWT = _ACL2.default.signAccessToken(user);
var adminJWT = _ACL2.default.signAccessToken(admin);
var adminJWTRefresh = _ACL2.default.signRefreshToken(admin);

describe("ACL tests", function () {

  beforeAll(function () {
    return _ACL2.default.allow('user', 'stores', 'get');
  });

  it("Should be authorized for user to get stories", function () {
    var isAuthorized = _ACL2.default.isAuthorized('stores:get');
    return new Promise(function (resolve, reject) {
      isAuthorized(user, {}, function (result) {
        expect(result).toBe(undefined);
        resolve();
      });
    });
  });

  it("Should not be authorized for user to edit stories", function () {
    var isAuthorized = _ACL2.default.isAuthorized('stores:edit');
    return new Promise(function (resolve, reject) {
      isAuthorized(user, {}, function (result) {
        expect(result).toMatchObject(new _httpErrors2.default.Forbidden("Permission denied"));
        resolve();
      });
    });
  });

  it("Should be authorized for admin to edit stories", function () {
    var isAuthorized = _ACL2.default.isAuthorized('stores:edit');
    return new Promise(function (resolve, reject) {
      isAuthorized(admin, {}, function (result) {
        expect(result).toBe(undefined);
        resolve();
      });
    });
  });

  it("Should be authenticated user", function () {
    return new Promise(function (resolve, reject) {
      _ACL2.default.isAuthenticated({ headers: { authorization: 'Bearer ' + userJWT } }, {}, function (result) {
        expect(result).toBe(undefined);
        resolve();
      });
    });
  });

  it("Should not be authenticated user", function () {
    return new Promise(function (resolve, reject) {
      _ACL2.default.isAuthenticated({ headers: { authorization: 'Bearer 1' + userJWT } }, {}, function (result) {
        expect(result).toMatchObject(_httpErrors2.default.Unauthorized("invalid token"));
        resolve();
      });
    });
  });

  it("Should allow user to get stories", function () {
    return new Promise(function (resolve, reject) {
      var canMiddleware = _ACL2.default.canMiddleware('stores:get');
      canMiddleware({ headers: { authorization: 'Bearer ' + userJWT } }, {}, function (result) {
        //expect(result).toMatchObject(HttpError.Unauthorized("Invalid token"));
        expect(result).toBe(undefined);
        resolve();
      });
    });
  });

  it("Should not allow user to edit stories", function () {
    return new Promise(function (resolve, reject) {
      var canMiddleware = _ACL2.default.canMiddleware('stores:edit');
      canMiddleware({ headers: { authorization: 'Bearer ' + userJWT } }, {}, function (result) {
        expect(result).toMatchObject(_httpErrors2.default.Forbidden("Permission denied"));
        resolve();
      });
    });
  });

  it("Should allow admin to edit stories", function () {
    return new Promise(function (resolve, reject) {
      var canMiddleware = _ACL2.default.canMiddleware('stores:edit');
      canMiddleware({ headers: { authorization: 'Bearer ' + adminJWT } }, {}, function (result) {
        expect(result).toBe(undefined);
        resolve();
      });
    });
  });

  it("Should verify refresh token", function () {
    return new Promise(function (resolve, reject) {
      _ACL2.default.isRefreshTokenValid({ headers: { authorization: 'Bearer ' + adminJWTRefresh } }, {}, function (result) {
        expect(result).toBe(undefined);
        resolve();
      });
    });
  });

  it("Should reject invalid refresh token", function () {
    return new Promise(function (resolve, reject) {
      _ACL2.default.isRefreshTokenValid({ headers: { authorization: 'Bearer ' + adminJWT } }, {}, function (result) {
        expect(result).toMatchObject(_httpErrors2.default.Unauthorized("Invalid refresh token"));
        resolve();
      });
    });
  });

  it("Should reject invalid accept token", function () {
    return new Promise(function (resolve, reject) {
      _ACL2.default.isAuthenticated({ headers: { authorization: 'Bearer ' + adminJWTRefresh } }, {}, function (result) {
        expect(result).toMatchObject(_httpErrors2.default.Unauthorized("Invalid access token"));
        resolve();
      });
    });
  });

  it("Should sign access token", function (done) {
    var token = _ACL2.default.signAccessToken(user);
    expect(_jsonwebtoken2.default.verify(token, jwtSecret)).toMatchObject({
      id: 1,
      roles: ['user'],
      exp: expect.any(Number),
      iat: expect.any(Number),
      provider: 'password'
      //device: expect.any(String),
      //api: 'v1'
    });
    done();
  });

  it("Should not sign access token with incomplete data", function (done) {
    expect(function () {
      return _ACL2.default.signAccessToken({ user: { id: 1, provider: 'password' } });
    }).toThrowError(_httpErrors2.default.BadRequest("Signature payload incomplete"));
    done();
  });

  //TODO: check blacklist
});