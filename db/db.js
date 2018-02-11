const Sequelize = require('sequelize');
require('../util/dotenv');

const db = new Sequelize(process.env.DB_URL);

module.exports = db;

module.exports.Sequelize = Sequelize;
