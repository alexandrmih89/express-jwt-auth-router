'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _httpErrors = require('http-errors');

var _httpErrors2 = _interopRequireDefault(_httpErrors);

var _passport = require('./util/passport');

var _passport2 = _interopRequireDefault(_passport);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _supertest = require('supertest');

var _supertest2 = _interopRequireDefault(_supertest);

var _db = require('./db/db');

var _db2 = _interopRequireDefault(_db);

var _ACL = require('./ACL');

var _ACL2 = _interopRequireDefault(_ACL);

var _authRouter = require('./authRouter');

var _authRouter2 = _interopRequireDefault(_authRouter);

var _auth = require('./auth');

var _expressResultHandlers = require('./util/expressResultHandlers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var user = {
  id: 1,
  username: 'a@b.cl',
  roles: ['user']
};

var userToken = _ACL2.default.signAccessToken({ user: _extends({}, user, { provider: 'password' }) });
var userRefreshToken = _ACL2.default.signRefreshToken({ user: _extends({}, user, { provider: 'password' }) });

var PasswordIncorrect = function PasswordIncorrect() {
  return _httpErrors2.default.Unauthorized("Password Incorrect");
};
var AlreadyTaken = function AlreadyTaken() {
  return _httpErrors2.default.Forbidden("Username is already taken");
};

var app = (0, _express2.default)();
app.use(_passport2.default.initialize());
(0, _auth.applyStrategies)(_passport2.default, {
  loginQuery: function loginQuery(_ref) {
    var username = _ref.username,
        password = _ref.password;
    return new Promise(function (resolve, reject) {
      username === 'a@b.cl' && password === '123' ? resolve({ toJSON: function toJSON() {
          return user;
        } }) : reject(PasswordIncorrect());
    });
  },
  registerQuery: function registerQuery(userData) {
    return new Promise(function (resolve, reject) {
      return userData.username !== 'a@b.cl' ? resolve({ toJSON: function toJSON() {
          return _extends({ id: user.id }, userData, { roles: user.roles });
        } }) : reject(AlreadyTaken());
    });
  }
});
app.use(_bodyParser2.default.json());
app.use(_authRouter2.default);
app.use(_expressResultHandlers.jsonResultHandler);
app.use(_expressResultHandlers.validationErrorHandler);
app.use(_expressResultHandlers.jsonErrorHandler);

describe("Auth router tests", function () {

  beforeAll(function () {
    console.log('sync?');
    return _db2.default.query("CREATE EXTENSION POSTGIS;").catch(function () {}).then(function () {
      return _db2.default.sync({ force: true }).then(function () {
        return console.log('database sync complete');
      });
    });
  });

  it("Should signup", function () {
    return (0, _supertest2.default)(app).post("/signup").send({
      username: 'ab@b.cl',
      password: '123'
    }).then(function (response) {
      expect(response.body).toMatchObject({ user: _extends({}, user, { username: 'ab@b.cl', provider: 'password' }), accessToken: expect.any(String), refreshToken: expect.any(String) });
      expect(response.statusCode).toBe(200);
    });
  });

  it("Should not signup with registered user", function () {
    return (0, _supertest2.default)(app).post("/signup").send({
      username: 'a@b.cl',
      password: '123'
    }).then(function (response) {
      expect(response.body.message).toBe("Username is already taken");
      expect(response.statusCode).toBe(403);
    });
  });

  it("Should signin", function () {
    return (0, _supertest2.default)(app).post("/signin").send({
      username: 'a@b.cl',
      password: '123'
    }).then(function (response) {
      expect(response.body).toMatchObject({ user: _extends({}, user, { provider: 'password' }), accessToken: expect.any(String), refreshToken: expect.any(String) });
      expect(response.statusCode).toBe(200);
    });
  });

  it("Should not signin with wrong password", function () {
    return (0, _supertest2.default)(app).post("/signin").send({
      username: 'a@b.cl',
      password: '1234'
    }).then(function (response) {
      expect(response.body.message).toBe("Password Incorrect");
      expect(response.statusCode).toBe(401);
    });
  });

  it("Should refresh", function () {
    return (0, _supertest2.default)(app).get("/refresh").set('Authorization', 'Bearer ' + userRefreshToken).then(function (response) {
      expect(response.body).toMatchObject({ user: { id: user.id, roles: user.roles, provider: 'password' }, accessToken: expect.any(String) });
      expect(response.statusCode).toBe(200);
    });
  });

  it("Should not refresh", function () {
    return (0, _supertest2.default)(app).get("/refresh").set('Authorization', 'Bearer 1' + userRefreshToken).then(function (response) {
      expect(response.body.message).toBe("Invalid refresh token");
      expect(response.statusCode).toBe(401);
    });
  });

  it("Should signout", function () {
    return (0, _supertest2.default)(app).get("/signout").set('Authorization', 'Bearer ' + userToken).then(function (response) {
      expect(response.body.message).toBe("Signed out successfully");
      expect(response.statusCode).toBe(200);
    });
  });

  //TODO: test facebook
});