import HttpErrors from 'http-errors';
import _ from 'lodash';
import bcrypt from 'bcrypt';
import User from './User';
import Role from '../Role/Role';
import Contact from '../Contact/Contact';
import UserProvider from '../UserProvider/UserProvider';

const userRoles = 'user';
const facebookRole = 'user';

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
    roles: roles.map(role => ({ role })),
    contacts: [{ kind: 'email', contact: reqUser.email }],
  }, {
    include: [ {
      model: Role, as: 'roles'
    }, {
      model: Contact, as: 'contacts'
    }]
  });
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
  const user = await User.create({
    username: fbProfile.email || fbProfile.emails[0]
  });
  await UserProvider.create({ identifier: fbProfile.id, provider: 'facebook' })
    .then(authProvider => user.addAuthProvider(authProvider));

  await (_.isArray(facebookRole) ? user.addRole(facebookRole) : user.addRoles(facebookRole));

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