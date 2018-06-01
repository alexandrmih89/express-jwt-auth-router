const Sequelize = require('sequelize');
const db = require('../db');
//TODO: replace bcrypt with argon2? or increment bcrypt complexity
const bcrypt = require('bcrypt');

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
    beforeCreate: function (user) {
      if(user.password) {
        user.password = bcrypt.hashSync(user.password, 10);
      }
    }
  }
});

module.exports = User;
