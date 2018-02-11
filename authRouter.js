const express = require('express');
const passport = require('./util/passport');
const {
  authenticate,
  generateAccessToken,
  generateRefreshToken,
  signIn,
  signOut,
} = require('./auth');
const acl = require('./ACL');

const apiRouter = express.Router();

const auth = authenticate(passport);

apiRouter.post('/signup', auth('local-signup'), generateAccessToken, generateRefreshToken, signIn);
apiRouter.post('/signin', auth('local-login'), generateAccessToken, generateRefreshToken, signIn);
apiRouter.get('/facebook', auth('facebook-token'), generateAccessToken, generateRefreshToken, signIn);
apiRouter.get('/refresh', acl.isRefreshTokenValid, generateAccessToken, signIn);
apiRouter.get('/signout', acl.isAuthenticated, signOut);

module.exports = apiRouter;
