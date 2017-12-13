import Sequelize from 'sequelize';
import db from '../db';
//TODO: replace bcrypt with argon2? or increment bcrypt complexity
import bcrypt from 'bcrypt';

const User = db.define('user', {
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  password: {
    type: Sequelize.STRING
  }
}, {
  paranoid: true,
  hooks: {
    beforeValidate: function (user) {
      if(user.password) {
        user.password = bcrypt.hashSync(user.password, 10);
      }
    }
  }
});

export default User;
