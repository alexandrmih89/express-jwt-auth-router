const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const Contact = require('./Contact');
const UserProvider = require('./UserProvider');

User.hasMany(Contact);
User.hasMany(Contact, { as: 'emails' });
User.hasMany(Contact, { as: 'phones' });
User.hasMany(UserProvider, { as: 'authProviders' });
User.belongsToMany(Role, { as: 'roles', through: 'user_roles' });

Role.belongsToMany(Role, { as: 'parentRoles', through: 'role_parents' });
Role.belongsToMany(Permission, { as: 'permissions', through: 'roles_permissions' });
