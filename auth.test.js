'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _httpErrors = require('http-errors');

var _httpErrors2 = _interopRequireDefault(_httpErrors);

var _auth = require('./auth');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var userRole = 'user';
var user = { user: { id: 1, provider: 'password', roles: [userRole] } };

describe("Auth tests", function () {

  it("Should generate access token", function () {
    return new Promise(function (resolve, reject) {
      (0, _auth.generateAccessToken)(user, {}, function (result) {
        expect(result).toBe(undefined);
        expect(user).toMatchObject(_extends({}, user, {
          accessToken: expect.any(String)
        }));
        resolve();
      });
    });
  });

  it("Should not generate access token", function () {
    return new Promise(function (resolve, reject) {
      (0, _auth.generateAccessToken)({ user: { id: 1 } }, {}, function (result) {
        expect(result).toMatchObject(_httpErrors2.default.BadRequest("Signature payload incomplete"));
        resolve();
      });
    });
  });

  it("Should generate refresh token", function () {
    return new Promise(function (resolve, reject) {
      (0, _auth.generateRefreshToken)(user, {}, function (result) {
        expect(result).toBe(undefined);
        expect(user).toMatchObject(_extends({}, user, {
          refreshToken: expect.any(String)
        }));
        resolve();
      });
    });
  });

  it("Should not generate refresh token", function () {
    return new Promise(function (resolve, reject) {
      (0, _auth.generateRefreshToken)({ user: { id: 1 } }, {}, function (result) {
        expect(result).toMatchObject(_httpErrors2.default.BadRequest("Signature payload incomplete"));
        resolve();
      });
    });
  });
});