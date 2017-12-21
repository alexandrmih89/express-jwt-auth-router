'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.signOut = exports.signIn = exports.authenticate = exports.applyStrategies = exports.generateRefreshToken = exports.generateAccessToken = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _passportLocal = require('passport-local');

var _passportLocal2 = _interopRequireDefault(_passportLocal);

var _passportFacebookToken = require('passport-facebook-token');

var _passportFacebookToken2 = _interopRequireDefault(_passportFacebookToken);

var _ACL = require('./ACL');

var _ACL2 = _interopRequireDefault(_ACL);

require('./util/dotenv');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fbId = process.env.FB_ID;
var fbSecret = process.env.FB_SECRET;

var localStrategy = function localStrategy(verifyCallback) {
  return new _passportLocal2.default({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  }, verifyCallback);
};

var signinStrategy = function signinStrategy(loginQuery) {
  return function (req, username, password, done) {
    loginQuery(req.body).then(function (user) {
      return done(null, _extends({}, user.toJSON(), { provider: 'password' }));
    }).catch(done);
  };
};

var signupStrategy = function signupStrategy(registerQuery) {
  return function (req, username, password, done) {
    registerQuery(req.body).then(function (user) {
      return done(null, _extends({}, user.toJSON(), { provider: 'password', firstLogin: true }));
    }).catch(done);
  };
};

var generateAccessToken = exports.generateAccessToken = function generateAccessToken(req, res, next) {
  try {
    //TODO: GET USER FROM DATABASE
    req.accessToken = _ACL2.default.signAccessToken(req);
    next();
  } catch (e) {
    next(e);
  }
};

var generateRefreshToken = exports.generateRefreshToken = function generateRefreshToken(req, res, next) {
  try {
    req.refreshToken = _ACL2.default.signRefreshToken(req);
    next();
  } catch (e) {
    next(e);
  }
};

//TODO: reset access from facebook
var facebookStrategy = function facebookStrategy(profileFields, fbUserQuery, fbCreateUser) {
  return new _passportFacebookToken2.default({
    clientID: fbId,
    clientSecret: fbSecret,
    profileFields: profileFields,
    passReqToCallback: true
  }, function (req, facebookAccessToken, facebookRefreshToken, fbProfile, done) {
    fbUserQuery(fbProfile._json, req).then(function (user) {
      if (user) {
        return user.toJSON();
      }
      return fbCreateUser(fbProfile._json, req).then(function (user) {
        return _extends({}, user.toJSON(), { firstLogin: true });
      });
    }).then(function (user) {
      done(null, _extends({}, user, { provider: 'facebook' }));
    }).catch(function (error) {
      return done(error, null);
    });
  });
};

var applyStrategies = exports.applyStrategies = function applyStrategies(passport, _ref) {
  var loginQuery = _ref.loginQuery,
      registerQuery = _ref.registerQuery,
      fbProfileFields = _ref.fbProfileFields,
      fbUserQuery = _ref.fbUserQuery,
      fbCreateUser = _ref.fbCreateUser;


  passport.use('local-login', localStrategy(signinStrategy(loginQuery)));

  passport.use('local-signup', localStrategy(signupStrategy(registerQuery)));

  var profileFields = fbProfileFields || ['id', 'email', 'displayName', 'gender', 'picture', 'age_range', 'cover', 'link', 'locale', 'timezone', 'updated_time', 'verified'];

  passport.use('facebook-token', facebookStrategy(profileFields, fbUserQuery, fbCreateUser));
};

var authenticate = exports.authenticate = function authenticate(passport) {
  return function (strategy) {
    return passport.authenticate(strategy, { session: false });
  };
};

var signIn = exports.signIn = function signIn(req, res, next) {
  res.result = {
    user: req.user,
    accessToken: req.accessToken,
    refreshToken: req.refreshToken
  };
  next();
};

var signOut = exports.signOut = function signOut(req, res, next) {
  //TODO: revoke all tokens iat before for this user and device
  res.result = {
    message: "Signed out successfully"
  };
  next();
};