const Sequelize = require('sequelize');
const db = require('../db');

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

module.exports = Permission;