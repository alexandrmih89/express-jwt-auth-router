import ACL from 'acl';
import Promise from 'bluebird';
import SequelizeBackend from 'acl-sequelize-backend';

export default (db) => {

  const aclOptions = {};
  const tablePrefix = 'acl_';

  let acl = new ACL(new SequelizeBackend(db, tablePrefix, aclOptions));

  //const addUserRoles = acl.addUserRoles;

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

  return acl;
}