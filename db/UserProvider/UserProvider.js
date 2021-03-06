const Sequelize = require('sequelize');
const db = require('../db');

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
}, {
  paranoid: true,
});

module.exports = UserProvider;