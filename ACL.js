import ACL from 'acl';
import Promise from 'bluebird';
import HttpError from 'http-errors';
import SequelizeBackend from 'acl-sequelize-backend';
import combine from './combine';
import { isAuthenticated } from './auth';

let allowed = [];

//TODO: use memory or redis and load roles from database
export default (db, { admin = 'admin' } = {}) => {

  const aclOptions = {};
  const tablePrefix = 'acl_';

  //let acl = new ACL(new SequelizeBackend(db, tablePrefix, aclOptions));
  let acl = new ACL(new ACL.memoryBackend());

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

  acl.push = (roles, resources, permissions) => {
    allowed.push({ roles, resources, permissions });
  };

  acl.build = () => {
    return db.models.role_parents.findAll().then(parentRoles => {
      parentRoles.forEach(({ roleRole, parentRoleRole }) => {
        acl.addRoleParents(roleRole, parentRoleRole, (err) => {
          console.log(err, roleRole, parentRoleRole);
        });
      });
    })
      .then(() => {
        return db.models.user_roles.findAll().then(userRoles => {
          userRoles.forEach(({ userId, roleRole }) => {
            acl.addUserRoles(userId, roleRole, (err) => {
              console.warn(err, userId, roleRole);
            });
          });
        });
      })
      .then(() => {
        allowed.forEach(({ roles, resources, permissions }) => {
          acl.allow(roles, resources, permissions, (err) => {
            console.log(err, roles, resources, permissions);
          })
        });
      });
  };

  acl.isAuthenticated = isAuthenticated;

  acl.canMiddleware = (permission, when = () => true) =>
    combine([isAuthenticated, (req, res, next) => {
      const p = permission.split(":");
      acl.hasRole(req.user.id, admin, (err, isAdmin) => {
        if(isAdmin) {
          next();
        } else {
          acl.isAllowed(req.user.id, p[0], p[1], (err, allowed) => {
            if (err) {
              next(err);
            } else if (allowed && when(req, res)) {
              next();
            } else {
              next(new HttpError.Forbidden("Permission denied"));
            }
          });
        }
      });
    }]);

  acl.canSkipMiddleware = (permission, when = () => true) =>
    combine([isAuthenticated, (req, res, next) => {
      const p = permission.split(":");
      acl.hasRole(req.user.id, admin, (err, isAdmin) => {
        if (isAdmin) {
          next();
        } else {
          acl.isAllowed(req.user.id, p[0], p[1], (err, allowed) => {
            if (allowed && when(req, res)) {
              next();
            } else {
              next('route');
            }
          });
        }
      });
    }]);


  return acl;
}