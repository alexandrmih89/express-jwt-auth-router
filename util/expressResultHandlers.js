'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.jsonErrorHandler = exports.validationErrorHandler = exports.jsonResultHandler = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _index = require('sequelize/lib/errors/index');

var jsonResultHandler = exports.jsonResultHandler = function jsonResultHandler(req, res, next) {
  if (res.result) {
    res.json(res.result);
  }
};

var validationErrorHandler = exports.validationErrorHandler = function validationErrorHandler(err, req, res, next) {
  if (err instanceof _index.ValidationError) {
    err.statusCode = 400;
  }
  next(err);
};

var jsonErrorHandler = exports.jsonErrorHandler = function jsonErrorHandler(err, req, res, next) {
  if (err) {
    var status = err.statusCode || err.status || 500;
    console.error(err);
    res.status(status).json(_extends({}, err, {
      message: err.message,
      type: err.name,
      status: status
    }));
  }
  next();
};