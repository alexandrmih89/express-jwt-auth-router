import ACL from 'acl';
import _ from 'lodash';
import expressJwt from 'express-jwt';
import jwt from 'jsonwebtoken';
import HttpError from 'http-errors';
import combine from './util/combine';
import './util/dotenv';

const jwtSecret = process.env.JWT_SECRET;

const authenticateJWT = expressJwt({ secret: jwtSecret });
const adminRole = process.env.ADMIN_ROLE || 'admin';

let r = process.env.ACL_REDIS ? process.env.ACL_REDIS.split(',') : false;
const aclBackend = r ? new ACL.redisBackend(r[0], r[1] || '') : new ACL.memoryBackend();
let acl = new ACL(aclBackend);

acl.isAuthorized = isAuthorized;
acl.isAuthenticated = combine([ authenticateJWT, isAuthenticated ]);
acl.signAccessToken = signAccessToken;
acl.signRefreshToken = signRefreshToken;
acl.isRefreshTokenValid = isRefreshTokenValid;

acl.canMiddleware = (permission, when) => combine([ acl.isAuthenticated, isAuthorized(permission, when) ]);


export default acl;



function isAuthorized(permission, when = (req, res) => true) {
  return (req, res, next) => {

    const p = permission.split(":");

    const { roles } = req.user;

    //TODO: should I use memory or redis here???
    acl.areAnyRolesAllowed(roles, p[0], p[1])
      .then((isAllowed) => {
        if(isAllowed && when(req, res)) {
          next();
          return;
        }

        if(_.includes(roles, adminRole)) {
          next();
          return;
        }

        throw new HttpError.Forbidden("Permission denied");
      })
      .catch(next);
  }
}

function isAuthenticated(req, res, next) {
  if(req.user.type !== 'access') {
    return next(HttpError.Unauthorized("Invalid access token"));
  }
  //TODO: check if access token is blacklisted
  return next();
}

function isRefreshTokenValid(req, res, next) {
  authenticateJWT(req, res, (err) => {
    if(req.user && !req.user.exp && req.user.type === 'refresh') { //check if token expires, then reject, cause it's an accessToken
      //TODO: check if refresh token is blacklisted
      return next();
    } else {
      err = HttpError.Unauthorized("Invalid refresh token");
    }
    return next(err);
  });
}

const signatureNotComplete = () => new HttpError.BadRequest("Signature payload incomplete");

function signAccessToken(req) {
  return signToken(req, 'access', 300);
}

function signRefreshToken(req) {
  return signToken(req, 'refresh');
}

function signToken(req, type, expiresIn) {
  const { id, provider, roles, device, ...user } = req.user;

  if(!id || !provider || !roles) {
    throw signatureNotComplete();
  }

  //TODO: api?
  return jwt.sign({ id, provider, roles, device, type, ...user }, jwtSecret, expiresIn ? { expiresIn } : {});
}