import ACL from 'acl';
import Promise from 'bluebird';
import HttpError from 'http-errors';
import SequelizeBackend from 'acl-sequelize-backend';
import combine from './combine';
import { isAuthenticated } from './auth';

//TODO: use memory or redis and load roles from database
export default (db) => {

  const aclOptions = {};
  const tablePrefix = 'acl_';

  let acl = new ACL(new SequelizeBackend(db, tablePrefix, aclOptions));

  //TODO: this does not work as a promise :(
  acl.addUserRolesPromise = (userId, roles) => {
    return new Promise((resolve, reject) => {
      acl.addUserRoles(userId, roles, (err) => {
        if(err) {
          reject(err);
        } else {
          resolve();
        }
      });
    })
  };

  acl.isAuthenticated = isAuthenticated;

  acl.canMiddleware = (permission, when = () => true) =>
    combine([isAuthenticated, (req, res, next) => {
      const p = permission.split(":");
      acl.isAllowed(req.user.id, p[0], p[1], (err, allowed) => {
        if (err) {
          next(err);
        } else if (allowed && when(req, res)) {
          next();
        } else {
          next(new HttpError.Forbidden("Permission denied"));
        }
      });
    }]);

  acl.canSkipMiddleware = (permission, when = () => true) =>
    combine([isAuthenticated, (req, res, next) => {
      const p = permission.split(":");
      acl.isAllowed(req.user.id, p[0], p[1], (err, allowed) => {
        if (allowed && when(req, res)) {
          next();
        } else {
          next('route');
        }
      });
    }]);


  return acl;
}