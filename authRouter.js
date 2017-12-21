'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _passport = require('./util/passport');

var _passport2 = _interopRequireDefault(_passport);

var _auth = require('./auth');

var _ACL = require('./ACL');

var _ACL2 = _interopRequireDefault(_ACL);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var apiRouter = _express2.default.Router();

var auth = (0, _auth.authenticate)(_passport2.default);

apiRouter.post('/signup', auth('local-signup'), _auth.generateAccessToken, _auth.generateRefreshToken, _auth.signIn);
apiRouter.post('/signin', auth('local-login'), _auth.generateAccessToken, _auth.generateRefreshToken, _auth.signIn);
apiRouter.get('/facebook', auth('facebook-token'), _auth.generateAccessToken, _auth.generateRefreshToken, _auth.signIn);
apiRouter.get('/refresh', _ACL2.default.isRefreshTokenValid, _auth.generateAccessToken, _auth.signIn);
apiRouter.get('/signout', _ACL2.default.isAuthenticated, _auth.signOut);

exports.default = apiRouter;