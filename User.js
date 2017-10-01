import Sequelize from 'sequelize';
import bcrypt from 'bcrypt';
import HttpErrors from 'http-errors';

export default (db, acl, customize = () => {}) => {
  //TODO: errors translation
  const PasswordIncorrect = () => HttpErrors.Unauthorized("Password Incorrect");
  const UserNotFound = () => HttpErrors.NotFound("User not found");
  const AlreadyTaken = () => HttpErrors.Forbidden("Username is already taken");

  const User = db.define('User', {
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      },
      roles: false
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    address: {
      type: Sequelize.STRING
    }
  }, {
    hooks: {
      beforeValidate: function (user) {
        user.password = bcrypt.hashSync(user.password, 10);
      }
    }
  });

  User.findByUsername = (username) => User.findAll({
    where: {username},
    include: [{all: true}]
  })
    .then(users => users[0]);

  User.login = (reqUser) => User.findByUsername(reqUser.username)
    .then(user => {
      if (!user) {
        throw UserNotFound();
      }
      user.validatePassword(reqUser.password);
      return user;
    });

  User.register = (reqUser) => User.findByUsername(reqUser.username)
    .then((user) => {
      if (user) {
        throw AlreadyTaken();
      }
      return User.create(reqUser)
        .then(user => {
          //TODO: it should be a promise
          //TODO: add multiple roles from
          //TODO: set role by default
          acl.addUserRolesPromise(user.id, 'user');
          return user;
        });
    });

  User.prototype.validatePassword = function (password) {
    if (this.password !== password) {
      throw PasswordIncorrect();
    }
  };

  User.prototype.toJSON = function () {
    return {
      ...this.get(),
      password: undefined
    };
  };

  customize(User);

  return User;
};