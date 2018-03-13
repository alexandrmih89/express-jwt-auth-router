Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.signOut = exports.signIn = exports.authenticate = exports.applyStrategies = exports.generateRefreshToken = exports.generateAccessToken = undefined;

const LocalStrategy = require('passport-local');
const FacebookTokenStrategy = require('passport-facebook-token');
const GoogleTokenStrategy = require('passport-google-token');
const acl = require('./ACL');
require('./util/dotenv');

const fbId = process.env.FB_ID;
const fbSecret = process.env.FB_SECRET;
const googleId = process.env.GOOGLE_ID;
const googleSecret = process.env.GOOGLE_SECRET;

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

const generateAccessToken = exports.generateAccessToken = (req, res, next) => {
  try {
    //TODO: GET USER FROM DATABASE
    req.accessToken = acl.signAccessToken(req);
    next();
  } catch (e) {
    next(e);
  }
};

const generateRefreshToken = exports.generateRefreshToken = (req, res, next) => {
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

const googleStrategy = (profileFields, googleUserQuery, googleCreateUser) => {
  return new GoogleTokenStrategy({
      clientID: googleId,
      clientSecret: googleSecret,
      profileFields,
      passReqToCallback: true
    }, (req, googleAccessToken, googleRefreshToken, googleProfile, done) => {
      googleUserQuery(googleProfile._json, req)
        .then(user => {
          if (user) {
            return user.toJSON();
          }
          return googleCreateUser(googleProfile._json, req)
            .then(user => ({ ...user.toJSON(), firstLogin: true }));
        })
        .then(user => {
          done(null, { ...user, provider: 'google' });
        })
        .catch(error => done(error, null));
    }
  );
};

const applyStrategies = exports.applyStrategies = (passport, {
  loginQuery,
  registerQuery,
  fbProfileFields,
  fbUserQuery,
  fbCreateUser,
  googleProfileFields,
  googleUserQuery,
  googleCreateUser,
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

  const gProfileFields = googleProfileFields || [
    'id',
    'email',
    'displayName',
    'gender',
    'picture',
    'age_range',
    'cover', 'link', 'locale', 'timezone', 'updated_time', 'verified'];

  passport.use('facebook-token', facebookStrategy(profileFields, fbUserQuery, fbCreateUser))
  passport.use('google-token', googleStrategy(gProfileFields, googleUserQuery, googleCreateUser))
};

const authenticate = exports.authenticate = (passport) => (strategy) => passport.authenticate(strategy, { session: false });

const signIn = exports.signIn = (req, res, next) => {
  res.result = {
    user: req.user,
    accessToken: req.accessToken,
    refreshToken: req.refreshToken
  };
  next();
};

const signOut = exports.signOut = (req, res, next) => {
  //TODO: revoke all tokens iat before for this user and device
  res.result = {
    message: "Signed out successfully"
  };
  next();
};