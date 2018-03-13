const md5 = require('md5');
const nodemailer = require('nodemailer');
const httpErrors = require('http-errors');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const fs = require('fs');

const envPath = '.env.' + process.env.NODE_ENV;

fs.existsSync(envPath) ? dotenv.config({ path: envPath }) : dotenv.config();

const {
  User,
  PasswordReset,
  Contact
} = require('./db');

const sendConfirmationCode = exports.sendConfirmationCode = (req, res, next) => {
  let email = req.body.email;

  //generate random whole number
  let min = 1;
  let max = 9999;
  let rand = min + Math.random() * (max + 1 - min);
  let code = Math.floor(rand);

  let token = md5(code) + md5(md5(code));
  let hash = bcrypt.hashSync(token, 10);

  Contact
    .findOne({ where: {kind: 'email', contact: email} })
    .then(contact => {
      if (contact === null) {
        throw httpErrors(404, 'Email not found');
      }

      return User
        .findById(contact.userId)
        .then(user => {
          if (user === null) {
            throw httpErrors(404, 'User not found');
          }

          return PasswordReset
            .destroy({
              where: {
                email: email
              }
            })
            .then(() => {
              return PasswordReset
                .create({
                  email: email,
                  token: hash,
                })
                .then(sendResetLink(email, token))
                .then(result => {
                  res.result = {
                    message: 'Your code was successfully sent',
                    token: token
                  };
                  next();
                });
            });
        });
    })
    .catch(next);
}

const confirmCode = exports.confirmCode = (req, res, next) => {
  let code = req.params.code;

  PasswordReset
    .findAll()
    .then(async (passReset) => {

      var email = '';
      for (var i = 0; i < passReset.length; i++) {
        let hash = passReset[i].dataValues.token;
        if (bcrypt.compareSync(code, hash)) {
          email = passReset[i].dataValues.email;
        }
      }

      if (!email) {
        throw httpErrors(404, 'Your code is incorrect');
      }

      //TODO: password reset should go in model methods
      const contact = await Contact.findOne({ where: {kind: 'email', contact: email} });
      const user = await User.findById(contact.userId);

      if (user === null) {
        throw httpErrors(404, 'User not found');
      }

      //generate new password
      const password = user.generatePassword();
      const hash_pass = bcrypt.hashSync(password, 10);

      await user.update({ password: password });

      await PasswordReset
        .destroy({
          where: {
            email: email
          }
        });

      return Promise.resolve({
        email: email,
        password: password,
        hash_pass: hash_pass
      });


    })
    .then(res => sendPassword(res.email, res.password))
    .then(result => {
      res.result = { message: 'Your password was successfully reset' };
      next();
    })
    .catch(next);
}

const newPassword = exports.newPassword = (req, res, next) => {
  let token = req.body.token;
  let email = req.body.email;
  let password = req.body.password;
  let confirm = req.body.confirm;

  Contact
    .findOne({ where: {kind: 'email', contact: email} })
    .then(contact => {
      if (contact === null) {
        throw httpErrors(404, 'Email not found');
      }

      return User
        .findById(contact.userId)
        .then(user => {
          if (user === null) {
            throw httpErrors(404, 'User not found');
          }

          return PasswordReset
            .findOne({ where: { email: email } })
            .then(passReset => changePassword(passReset, password, confirm, token))
            .then(async result => {

              await user.update({ password: password });

              return {
                email: result.email
              }
            })
            .then(async result => {
              await PasswordReset
                .destroy({
                  where: {
                    email: result.email
                  }
                });
            })
            .then(result => {
              res.result = { message: 'Your password was successfully changed' };
              next();
            })

        });
    })
    .catch(next);
}

const changePassword = function (passReset, password, confirm, token) {
  //check token
  let hash = passReset.token;
  if (!bcrypt.compareSync(token, hash)) {
    throw httpErrors(404, 'Your code is incorrect');
  }

  if (password !== confirm) {
    throw httpErrors(404, 'Fields password and confirm are do not match');
  }

  return Promise.resolve({
    email: passReset.email,
    password: bcrypt.hashSync(password, 10)
  });

};

const sendPassword = function (email, password) {
  let name = process.env.SERVER_NAME;
  let from = process.env.MAIL_AUTH_USER;
  let mailOptions = {
    from: '"' + name + ' " <' + from + '>',
    to: email,
    subject: 'New password ✔',
    text: 'Your new password: ' + password,
    html: '<b>Your new password: ' + password + '</b>'
  };

  return send(mailOptions);
};

const sendResetLink = function(email, token) {
  let schema = process.env.SERVER_SCHEMA;
  let host = process.env.SERVER_HOST;
  let name = process.env.SERVER_NAME;
  let from = process.env.MAIL_AUTH_USER;
  let port = process.env.PORT;
  let link = schema + '://' + host + ':' + port + '/api/v1/password/confirm/' + token;

  let mailOptions = {
    from: '"' + name + ' " <' + from + '>',
    to: email,
    subject: 'Reset Password ✔',
    text: 'Your reset password link: ' + link,
    html: '<b>Your reset link: <a href="' + link + '"/>' + link + '</a></b>'
  };

  return send(mailOptions);
};

function send(mailOptions) {

  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE,
    auth: {
      user: process.env.MAIL_AUTH_USER,
      pass: process.env.MAIL_AUTH_PASS
    }
  });

  return transporter.sendMail(mailOptions);
}