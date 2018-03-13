const express = require('express');
const passport = require('./util/passport');
const {
  sendConfirmationCode,
  confirmCode,
  newPassword
} = require('./pass');
const passwordRouter = express.Router();

passwordRouter.post('/password/reset', sendConfirmationCode);
passwordRouter.get('/password/confirm/:code', confirmCode);
passwordRouter.post('/password/confirm', newPassword);

module.exports = passwordRouter;
