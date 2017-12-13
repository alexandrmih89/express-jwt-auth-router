import express from 'express';
import passport from './util/passport';
import {
  authenticate,
  generateAccessToken,
  generateRefreshToken,
  signIn,
  signOut,
} from './auth';
import acl from './ACL';

const apiRouter = express.Router();

const auth = authenticate(passport);

apiRouter.post('/signup', auth('local-signup'), generateAccessToken, generateRefreshToken, signIn);
apiRouter.post('/signin', auth('local-login'), generateAccessToken, generateRefreshToken, signIn);
apiRouter.get('/facebook', auth('facebook-token'), generateAccessToken, generateRefreshToken, signIn);
apiRouter.get('/refresh', acl.isRefreshTokenValid, generateAccessToken, signIn);
apiRouter.get('/signout', acl.isAuthenticated, signOut);

export default apiRouter;
