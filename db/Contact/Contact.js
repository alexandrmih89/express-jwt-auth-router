const Sequelize = require('sequelize');
const db = require('../db');

const Contact = db.define('contact', {
  kind: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  contact: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  type: {
    type: Sequelize.STRING,
  }
}, { paranoid: true });

module.exports = Contact;