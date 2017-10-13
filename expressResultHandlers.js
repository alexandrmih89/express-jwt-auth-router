import { ValidationError } from 'sequelize/lib/errors/index';

export const jsonResultHandler = (req, res, next) => {
  if(res.result) {
    res.json(res.result);
  }
};

export const validationErrorHandler = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    err.statusCode = 400;
  }
  next(err);
};

export const jsonErrorHandler = (err, req, res, next) => {
  if (err) {
    const status = err.statusCode || 500;
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