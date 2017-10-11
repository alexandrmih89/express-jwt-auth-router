import express from 'express';
import { jsonErrorHandler, jsonResultHandler, validationErrorHandler } from './expressResultHandlers';
import cors from 'cors';
import volleyball from 'volleyball';
import bodyParser from 'body-parser';
import passport from 'passport';
import authRouter from './authRouter';
import { applyStrategies } from './auth';

const app = express();

app.use(volleyball);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());

const port = parseInt(process.env.PORT, 10) || 3000;

const setupErrorHandlers = (router) => {

  /*** error handlers ***/

};

export default (db, opts) => {

  /*{
  loginQuery, //a function accepting User (from request) and returning a promise (usually db call) which should return User or throw error
  registerQuery, // a function accepting User and returning a promise (usually db call), to check if user exists
  fbProfileFields, // facebook profile fields. By default: [ 'id', 'email', 'displayName', 'gender', 'picture', 'age_range', 'cover', 'link', 'locale', 'timezone', 'updated_time', 'verified']
  fbUserQuery, // accepts fbProfile._json, returns a Promise with user formatted (usually db call), or null if nothing found. Should omit password and other sensitive data.
  fbCreateUser //
  }*/

  const {
    loginQuery,
    registerQuery,
    fbUserQuery,
    fbCreateUser,
    mountPoint = '/api/v1',
    apiRouter
  } = opts;

  applyStrategies(passport, {
    loginQuery,
    registerQuery,
    fbUserQuery,
    fbCreateUser
  });

  const auth = authRouter(passport);

  app.use(mountPoint, auth);
  app.use(mountPoint, apiRouter);

  /*** result handler must match the same routes
   * unlike error handlers (see below)
   ***/
  app.use(mountPoint, jsonResultHandler);

  /***
   * error handlers go after matched routes
   * if routes after are matched
   * errors before are skipped
   ***/
  app.use(validationErrorHandler);

  app.use(jsonErrorHandler);

  //apply to the latest router, otherwise latter will not work
  //setupHandlers(auth);

  setupErrorHandlers(apiRouter);

  return {
    app,
    startServer: ({ acl } = {}) => {
      const server = app.listen(port, () => {
        console.log('Listening on ', server.address());
        db.sync({force: false})
          .then(message => {
            console.log('...and DB syncronized.');
          });
        if(acl) {
          acl.build()
            .then(() => console.log('acl prepared'));
        }
        return server;
      });
    },
    startTest: ({ acl } = {}) => {
      return db.sync({force: false})
        .then(message => {
          console.log('...and DB prepared for test.');
          if(acl) {
            return acl.build()
              .then(() => console.log('acl prepared'));
          }
        });
    }
  };
}