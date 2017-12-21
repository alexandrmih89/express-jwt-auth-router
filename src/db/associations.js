import User from './User';
import Role from './Role';
import Permission from './Permission';
import Contact from './Contact';
import UserProvider from './UserProvider';

User.hasMany(Contact);
User.hasMany(Contact, { as: 'emails' });
User.hasMany(Contact, { as: 'phones' });
User.hasMany(UserProvider, { as: 'authProviders' });
User.belongsToMany(Role, { as: 'roles', through: 'user_roles' });

Role.belongsToMany(Role, { as: 'parentRoles', through: 'role_parents' });
Role.belongsToMany(Permission, { as: 'permissions', through: 'roles_permissions' });
