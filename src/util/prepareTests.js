import express from 'express';
import expressJWT from 'express-jwt';
import bodyParser from 'body-parser';
import { jsonErrorHandler, jsonResultHandler, validationErrorHandler } from './expressResultHandlers';

export function prepareTest(router) {
  const app = express();
  app.use(bodyParser.json());
  app.use(expressJWT({ secret: process.env.JWT_SECRET }));
  app.use(router);
  app.use(jsonResultHandler);
  app.use(validationErrorHandler);
  app.use(jsonErrorHandler);

  return app;
}
