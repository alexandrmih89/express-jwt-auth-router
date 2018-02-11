const express = require('express');
const expressJWT = require('express-jwt');
const bodyParser = require('body-parser');
const { jsonErrorHandler, jsonResultHandler, validationErrorHandler } = require('./expressResultHandlers');

module.exports.prepareTest = prepareTest;

function prepareTest(router) {
  const app = express();
  app.use(bodyParser.json());
  app.use(expressJWT({ secret: process.env.JWT_SECRET }));
  app.use(router);
  app.use(jsonResultHandler);
  app.use(validationErrorHandler);
  app.use(jsonErrorHandler);

  return app;
}