import express from 'express';
import {
  authenticate,
  generateAccessToken,
  generateRefreshToken,
  signIn,
  signOut,
  isRefreshTokenValid,
  isAuthenticated
} from './auth';

export default (passport) => {

  const apiRouter = express.Router();

  const auth = authenticate(passport);

  /*** auth ***/
  apiRouter.post('/signin', auth('local-login'), generateAccessToken, generateRefreshToken, signIn);
  apiRouter.post('/signup', auth('local-signup'), generateAccessToken, generateRefreshToken, signIn);
  apiRouter.get('/facebook', auth('facebook-token'), generateAccessToken, generateRefreshToken, signIn);
  apiRouter.get('/refresh', isRefreshTokenValid, generateAccessToken, signIn);
  apiRouter.get('/signout', isAuthenticated, signOut);
  /*** **** ***/

  return apiRouter;

}