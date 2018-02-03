'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.prepareTest = prepareTest;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _expressJwt = require('express-jwt');

var _expressJwt2 = _interopRequireDefault(_expressJwt);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _expressResultHandlers = require('./expressResultHandlers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function prepareTest(router) {
  var app = (0, _express2.default)();
  app.use(_bodyParser2.default.json());
  app.use((0, _expressJwt2.default)({ secret: process.env.JWT_SECRET }));
  app.use(router);
  app.use(_expressResultHandlers.jsonResultHandler);
  app.use(_expressResultHandlers.validationErrorHandler);
  app.use(_expressResultHandlers.jsonErrorHandler);

  return app;
}