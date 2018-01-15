import db from './db';
import User from './User';
import Role from './Role';
import Contact from './Contact';
import './User/UserScopes';
import './associations';

export default db;

export {
  User,
  Role,
  Contact
}

