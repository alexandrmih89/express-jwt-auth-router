import HttpError from 'http-errors';
import LocalStrategy from 'passport-local';
import FacebookTokenStrategy from 'passport-facebook-token';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import expressJwt from 'express-jwt';
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const fbId = process.env.FB_ID;
const fbSecret = process.env.FB_SECRET;

//TODO: set auth relevant errors
export const Unauthorized = (message) => new HttpError.Forbidden(message);
export const BadRequest = (message) => new HttpError.BadRequest(message);
export const Forbidden = (message) => new HttpError.Forbidden(message);

export const authenticateJWT = expressJwt({ secret: jwtSecret });

const localStrategy = (verifyCallback) => new LocalStrategy({
  usernameField : 'username',
  passwordField : 'password',
  passReqToCallback : true // allows us to pass back the entire request to the callback
}, verifyCallback);

const signin = (loginQuery) => (req, username, password, done) => {
  loginQuery(req.body)
    .then(user => done(null, { ...user.toJSON(), provider: 'password' }))
    .catch(done);
};

const signup = (registerQuery) => (req, username, password, done) => {
  registerQuery(req.body)
    .then(user => done(null, { ...user.toJSON(), provider: 'password', firstLogin: true }))
    .catch(done);
};

export const generateAccessToken = (req, res, next) => {
  //TODO: revoke accessTokens - need to remember all generated tokens and check them in isAuthenticated
  req.accessToken = jwt.sign({
    id: req.user.id,
    provider: req.user.provider
  }, jwtSecret, {
    expiresIn: 300
  });
  next();
};

export const generateRefreshToken = (req, res, next) => {
  //TODO: emit one token per user per device per session and remember the session. A valid refresh token should have a session.
  //TODO: add provider description to token to be able to reset token from provider
  req.refreshToken = jwt.sign({
    id: req.user.id,
    session: req.user.id,
    provider: req.user.provider
  }, jwtSecret);
  next();
};

//TODO: reset access from facebook
const facebookStrategy = (profileFields, fbUserQuery, fbCreateUser) =>
  new FacebookTokenStrategy({
      clientID: fbId,
      clientSecret: fbSecret,
      profileFields,
      passReqToCallback: true
    }, (req, facebookAccessToken, facebookRefreshToken, fbProfile, done) => {
      fbUserQuery(fbProfile._json)
        .then(user => {
          if(user) {
            return user;
          }
          return fbCreateUser(fbProfile._json)
            .then(user => ({ ...user, firstLogin: true  }));
        })
        .then(user => {
          if(user.firstLogin) {
            acl.addUserRoles(user.id, user.role || 'user');
          }
          done(null, { ...user, provider: 'facebook' });
        })
        .catch(error => done(error, null));
    }
  );

export const applyStrategies = (passport, {
  loginQuery,
  registerQuery,
  fbProfileFields,
  fbUserQuery,
  fbCreateUser
}) => {

  passport.use('local-login', localStrategy(signin(loginQuery)));

  passport.use('local-signup', localStrategy(signup(registerQuery)));

  const profileFields = fbProfileFields || [
    'id',
    'email',
    'displayName',
    'gender',
    'picture',
    'age_range',
    'cover', 'link', 'locale', 'timezone', 'updated_time', 'verified'];

  passport.use('facebook-token', facebookStrategy(profileFields, fbUserQuery, fbCreateUser))
};

export const authenticate = (passport) => (strategy) => passport.authenticate(strategy, { session: false });

export const isAuthenticated = (req, res, next) => {
  //TODO: check if token does not expire, then reject, cause it's a refreshToken
  //TODO: serialize user???
  authenticateJWT(req, res, (err) => {
    if(err) {
      return next(Unauthorized("Invalid token"));
    }
    next();
  });
};

export const signIn = (req, res, next) => {
  res.result = {
    user: req.user,
    accessToken: req.accessToken,
    refreshToken: req.refreshToken
  };
  next();
};

export const signOut = (req, res, next) => {
  //TODO: remove session
  //TODO: add message SignedOut
  next();
};

export const isRefreshTokenValid = (req, res, next) => {
  isAuthenticated(req, res, (err) => {
    if(req.user && !req.user.exp && req.user.session) { //check if token expires, then reject, cause it's an accessToken
      //TODO: check session here
      //TODO: how to generate session? A random?
      next();
    } else {
      err = Unauthorized("Invalid token");
    }
    next(err);
  });
};