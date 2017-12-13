import Sequelize from 'sequelize';
import '../util/dotenv';

const db = new Sequelize(process.env.DB_URL);

export default db;

export {
  Sequelize
};
