import Sequelize from 'sequelize';
import bcrypt from 'bcrypt';
import HttpErrors from 'http-errors';

export default (db, acl, customize = () => {}) => {
  //TODO: errors translation
  const PasswordIncorrect = () => HttpErrors.Unauthorized("Password Incorrect");
  const UserNotFound = () => HttpErrors.NotFound("User not found");
  const AlreadyTaken = () => HttpErrors.Forbidden("Username is already taken");

  const Role = db.define('role', {
    role: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  }, { paranoid: true });

  Role.belongsToMany(Role, { as: 'parentRoles', through: 'role_parents' });

  const User = db.define('user', {
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    password: {
      type: Sequelize.STRING
    }
  }, {
    paranoid: true,
    hooks: {
      beforeValidate: function (user) {
        if(user.password) {
          user.password = bcrypt.hashSync(user.password, 10);
        }
      }
    },
    defaultScope: {
      include: [{
        model: Role,
        as: 'roles'
      }]
    },
    userScope: {

    }
  });

  const Permission = db.define('permission', {
    permission: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  }, { paranoid: true });

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

  const Provider = db.define('provider', {
    type: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  }, { paranoid: true });

  const UserProvider = db.define('user_provider', {
    identifier: {
      type: Sequelize.STRING,
      allowNull: false,
      //unique: true, //TODO: composite PK???
      validate: {
        notEmpty: true
      }
    }
  });

  UserProvider.belongsTo(Provider, { as: 'provider' });

  Role.belongsToMany(Permission, { as: 'permissions', through: 'roles_permissions' });

  User.findByUsername = (username) => User.findOne({ where: { username }});

  User.login = (reqUser) => User.findByUsername(reqUser.username)
    .then(user => {
      if (!user) {
        throw UserNotFound();
      }
      user.validatePassword(reqUser.password);
      return user;
    });

  User.register = (reqUser, userRole = 'user') => User.findByUsername(reqUser.username)
    .then((user) => {
      if (user) {
        throw AlreadyTaken();
      }
      return User.create(reqUser)
        .then(user => {
          //TODO: it should be a promise
          //TODO: add multiple roles from
          //TODO: set role by default
          acl.addUserRoles(user.id, userRole);
          return user.addRole(userRole)
            .then(() => User.findById(user.id));
        });
    });

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

  User.facebookCreate = (fbProfile, req, facebookRole = 'user') => {
    return User.create({
      username: fbProfile.email || fbProfile.emails[0]
    })
    //TODO: optimize - load providers at application start?
      .then(user => Provider.findOne({where: { type: 'facebook' }})
        .then(provider => UserProvider.create({identifier: fbProfile.id})
          .then(authProvider => authProvider.setProvider(provider))
          .then(authProvider => user.addAuthProvider(authProvider)))
        .then(() => {
          acl.addUserRoles(user.id, facebookRole);
          return user.addRole(facebookRole);
        })
        .then(() => User.findById(user.id)));
  };

  User.prototype.createContact = function(kind, contact, type) {
    return Contact.create({ kind, contact, type })
      .then((contact) => {
        this.addContact(contact)
      });
  };

  User.prototype.validatePassword = function (password) {
    //TODO: remove plain comparison
    if (bcrypt.compareSync(this.password, password) || this.password !== password) {
      throw PasswordIncorrect();
    }
  };

  User.prototype.toJSON = function () {
    const user = this.get();
    console.log(user);
    return {
      ...user,
      //TODO: optimize query?
      roles: user.roles.map(({ role }) => role ),
      password: undefined,
      authProviders: undefined
    };
  };

  User.hasMany(Contact, { as: 'contacts' });
  User.hasMany(UserProvider, { as: 'authProviders' });
  User.belongsToMany(Role, { as: 'roles', through: 'user_roles' });

  const exports = {
    User,
    Role,
    Contact,
    Permission,
    UserProvider,
    Provider
  };

  customize(exports);

  return exports;
};