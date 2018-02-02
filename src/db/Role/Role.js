import Sequelize from 'sequelize';
import db from '../db';
import Permission from '../Permission/Permission';

const Role = db.define('role', {
  role: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  }
}, { paranoid: true });

Role.addRolesToUser = (roles = [], user) => {
  return Role.findAll({
    where: {
      role: {
        [Sequelize.Op.in]: roles
      }
    }
  }).then(roles => user.addRoles(roles));
};

export default Role;