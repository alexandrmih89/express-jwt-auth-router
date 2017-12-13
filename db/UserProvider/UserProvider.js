import Sequelize from 'sequelize';
import db from '../db';

const UserProvider = db.define('user_provider', {
  //TODO: composite PK???
  identifier: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  provider: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  }
});

export default UserProvider;