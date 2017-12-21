import Sequelize from 'sequelize';
import db from '../db';

const Permission = db.define('permission', {
  permission: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  }
}, { paranoid: true });

export default Permission;