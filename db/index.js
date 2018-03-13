const db = require('./db');
const User = require('./User');
const Role = require('./Role');
const Contact = require('./Contact');
const PasswordReset = require('./PasswordReset');
require('./User/UserScopes');
require('./associations');

module.exports = db;

module.exports.User = User;
module.exports.Role = Role;
module.exports.Contact = Contact;
module.exports.PasswordReset = PasswordReset;

