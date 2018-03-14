const HttpErrors = require('http-errors');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const db = require('../db');
const Sequelize = db.Sequelize;
const User = require('./User');
const Role = require('../Role/Role');
const Contact = require('../Contact/Contact');
const UserProvider = require('../UserProvider/UserProvider');
const Op = db.Op;

const userRoles = 'user';
const facebookRoles = 'user';
const googleRoles = 'user';

const PasswordIncorrect = () => HttpErrors.Unauthorized("Password Incorrect");
const UserNotFound = () => HttpErrors.NotFound("User not found");
const AlreadyTaken = () => HttpErrors.Forbidden("Username is already taken");
const EmailNotPresent = () => HttpErrors.BadRequest("No email present");

User.findByUsername = (username) => User.findOne({ where: { username }});

User.login = (reqUser) => User.findByUsername(reqUser.username)
  .then(user => {
    if (!user) {
      throw UserNotFound();
    }
    user.validatePassword(reqUser.password);
    return user;
  });

User.register = async (reqUser) => {
  const user = await User.findByUsername(reqUser.username);

  if (user) {
    throw AlreadyTaken();
  }

  if (!reqUser.email) {
    throw EmailNotPresent();
  }

  const roles = _.isArray(userRoles) ? userRoles : [userRoles];

  const newUser = await User.create({
    ...reqUser,
    contacts: [{ kind: 'email', contact: reqUser.email }],
  }, {
    include: [{
      model: Contact, as: 'contacts'
    }]
  });

  await Role.addRolesToUser(roles, newUser);

  return User.findById(newUser.id);
};

User.facebookQuery = (fbProfile) => User.findOne({
  include: [{
    model: UserProvider,
    as: 'authProviders',
    required: true,
    where: {
      identifier: fbProfile.id
    }
  }]
});

User.facebookCreate = async (fbProfile) => {

  const email = fbProfile.email || fbProfile.emails[0];

  const roles = _.isArray(facebookRoles) ? facebookRoles : [facebookRoles];

  const user = await User.create({
    username: email,
    contacts: [{ kind: 'email', contact: email }],
  }, {
    include: [{
      model: Contact, as: 'contacts'
    }]
  });

  await Role.addRolesToUser(roles, user);

  await UserProvider.create({ identifier: fbProfile.id, provider: 'facebook' })
    .then(authProvider => user.addAuthProvider(authProvider));

  return User.findById(user.id);
};

User.googleQuery = (googleProfile) => User.findOne({
  include: [{
    model: UserProvider,
    as: 'authProviders',
    required: true,
    where: {
      identifier: googleProfile.id
    }
  }]
});

User.googleCreate = async (googleProfile) => {

  const email = googleProfile.email || googleProfile.emails[0];

  const roles = _.isArray(googleRoles) ? googleRoles : [googleRoles];

  const user = await User.create({
    username: email,
    contacts: [{ kind: 'email', contact: email }],
  }, {
    include: [{
      model: Contact, as: 'contacts'
    }]
  });

  await Role.addRolesToUser(roles, user);

  await UserProvider.create({ identifier: googleProfile.id, provider: 'google' })
    .then(authProvider => user.addAuthProvider(authProvider));

  return User.findById(user.id);
};

User.prototype.validatePassword = function (password) {
  if (!bcrypt.compareSync(password, this.password)) {
    throw PasswordIncorrect();
  }
};

User.prototype.toJSON = function () {
  const user = this.get();
  return {
    ...user,
    //TODO: optimize query?
    roles: user.roles.map(({ role }) => role ),
    emails: user.emails.map(({ contact }) => contact ),
    password: undefined,
    authProviders: undefined
  };
};

User.prototype.generatePassword = function () {
  return Math.random().toString(36).slice(-8);
};