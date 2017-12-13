import Sequelize from 'sequelize';
import db from '../db';

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

export default Contact;