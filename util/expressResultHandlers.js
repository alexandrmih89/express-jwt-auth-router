Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.jsonErrorHandler = exports.validationErrorHandler = exports.jsonResultHandler = undefined;

const SequelizeErrors = require('sequelize/lib/errors/index');
const { ValidationError } = SequelizeErrors;

const jsonResultHandler = exports.jsonResultHandler = (req, res, next) => {
  if(res.result) {
    res.json(res.result);
  } else {
    console.warn('jsonResultHandler: result not defined');
  }
  next();
};

const validationErrorHandler = exports.validationErrorHandler = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    err.statusCode = 400;
  }
  next(err);
};

const jsonErrorHandler = exports.jsonErrorHandler = (err, req, res, next) => {
  if (err) {
    const status = err.statusCode || err.status || 500;
    console.error(err);
    res
      .status(status)
      .json({
        ...err,
        message: err.message,
        type: err.name,
        status,
      });
  }
  next();
};
