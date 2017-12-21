import LocalStrategy from 'passport-local';
import FacebookTokenStrategy from 'passport-facebook-token';
import acl from './ACL';
import './util/dotenv';

const fbId = process.env.FB_ID;
const fbSecret = process.env.FB_SECRET;

const localStrategy = (verifyCallback) => new LocalStrategy({
  usernameField : 'username',
  passwordField : 'password',
  passReqToCallback : true // allows us to pass back the entire request to the callback
}, verifyCallback);

const signinStrategy = (loginQuery) => (req, username, password, done) => {
  loginQuery(req.body)
    .then(user => done(null, { ...user.toJSON(), provider: 'password' }))
    .catch(done);
};

const signupStrategy = (registerQuery) => (req, username, password, done) => {
  registerQuery(req.body)
    .then(user => done(null, { ...user.toJSON(), provider: 'password', firstLogin: true }))
    .catch(done);
};

export const generateAccessToken = (req, res, next) => {
  try {
    //TODO: GET USER FROM DATABASE
    req.accessToken = acl.signAccessToken(req);
    next();
  } catch (e) {
    next(e);
  }
};

export const generateRefreshToken = (req, res, next) => {
  try {
    req.refreshToken = acl.signRefreshToken(req);
    next();
  } catch (e) {
    next(e);
  }
};

//TODO: reset access from facebook
const facebookStrategy = (profileFields, fbUserQuery, fbCreateUser) => {
  return new FacebookTokenStrategy({
      clientID: fbId,
      clientSecret: fbSecret,
      profileFields,
      passReqToCallback: true
    }, (req, facebookAccessToken, facebookRefreshToken, fbProfile, done) => {
      fbUserQuery(fbProfile._json, req)
        .then(user => {
          if (user) {
            return user.toJSON();
          }
          return fbCreateUser(fbProfile._json, req)
            .then(user => ({ ...user.toJSON(), firstLogin: true }));
        })
        .then(user => {
          done(null, { ...user, provider: 'facebook' });
        })
        .catch(error => done(error, null));
    }
  );
};

export const applyStrategies = (passport, {
  loginQuery,
  registerQuery,
  fbProfileFields,
  fbUserQuery,
  fbCreateUser
}) => {

  passport.use('local-login', localStrategy(signinStrategy(loginQuery)));

  passport.use('local-signup', localStrategy(signupStrategy(registerQuery)));

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

export const signIn = (req, res, next) => {
  res.result = {
    user: req.user,
    accessToken: req.accessToken,
    refreshToken: req.refreshToken
  };
  next();
};

export const signOut = (req, res, next) => {
  //TODO: revoke all tokens iat before for this user and device
  res.result = {
    message: "Signed out successfully"
  };
  next();
};