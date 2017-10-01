import ACL from 'acl';
import Promise from 'bluebird';
import HttpError from 'http-errors';
import SequelizeBackend from 'acl-sequelize-backend';

//TODO: use memory or redis and load roles from database
export default (db) => {

  const aclOptions = {};
  const tablePrefix = 'acl_';

  let acl = new ACL(new SequelizeBackend(db, tablePrefix, aclOptions));

  acl.addUserRolesPromise = (userId, roles) => {
    return new Promise((resolve, reject) => {
      acl.addUserRoles(userId, roles, (err) => {
        if(err) {
          reject(err);
        } else {
          resolve();
        }
      })
    })
  };

  acl.allowPromise = (roles, resources, permissions) => {
    return new Promise((resolve, reject) => {
      acl.allow(roles, resources, permissions, (err) => {
        if(err) {
          reject(err);
        } else {
          resolve();
        }
      });
    })
  };

  acl.canMiddleware = (permission, when = () => true) => (res, req, next) => {
    const p = permission.split(":");
    acl.isAllowed(p[0], p[1], (err, allowed) => {
      if(err) {
        next(err);
      } else if(allowed && when(req, res)) {
        next();
      } else {
        next(new HttpError.Forbidden("Permission denied"));
      }
    });
  };

  return acl;
}