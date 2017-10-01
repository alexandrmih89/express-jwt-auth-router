import ACL from 'acl';
import Promise from 'bluebird';
import SequelizeBackend from 'acl-sequelize-backend';

export default (db) => {

  const aclOptions = {};
  const tablePrefix = 'acl_';

  let acl = new ACL(new SequelizeBackend(db, tablePrefix, aclOptions));

  //const addUserRoles = acl.addUserRoles;

  acl.addUserRolesPromise = (userId, roles) => {
    console.log('enterign promise');
    return new Promise((resolve, reject) => {
      console.log('Before add user roles');
      acl.addUserRoles(userId, roles, (err) => {
        if(err) {
          console.log(err);
          reject(err);
        } else {
          console.log('resolved');
          resolve();
        }
      })
    })
  };

  return acl;
}