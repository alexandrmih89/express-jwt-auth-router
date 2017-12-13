import express from 'express';
import HttpErrors from 'http-errors';
import passport from './util/passport';
import bodyParser from 'body-parser';
import request from 'supertest';
import db from './db/db';
import acl from './ACL';
import authRouter from './authRouter';
import { applyStrategies } from './auth';
import {
  jsonResultHandler,
  jsonErrorHandler,
  validationErrorHandler
} from './util/expressResultHandlers';


const user = {
  id: 1,
  username: 'a@b.cl',
  roles: [ 'user' ]
};

const userToken = acl.signAccessToken({ user: { ...user, provider: 'password' }});
const userRefreshToken = acl.signRefreshToken({ user: { ...user, provider: 'password' }});

const PasswordIncorrect = () => HttpErrors.Unauthorized("Password Incorrect");
const AlreadyTaken = () => HttpErrors.Forbidden("Username is already taken");

const app = express();
app.use(passport.initialize());
applyStrategies(passport, {
  loginQuery: ({ username, password }) => new Promise((resolve, reject) => { username === 'a@b.cl' && password === '123' ? resolve({ toJSON: () => user }) : reject(PasswordIncorrect()) }),
  registerQuery: (userData) => new Promise((resolve, reject) => userData.username !== 'a@b.cl' ? resolve({ toJSON: () => ({ id: user.id, ...userData, roles: user.roles }) }) : reject(AlreadyTaken()))
});
app.use(bodyParser.json());
app.use(authRouter);
app.use(jsonResultHandler);
app.use(validationErrorHandler);
app.use(jsonErrorHandler);


describe("Auth router tests", () => {

  beforeAll(() => {
    console.log('sync?');
    return db.query("CREATE EXTENSION POSTGIS;")
      .catch(() => {
      })
      .then(() => db.sync({force: true})
        .then(() => console.log('database sync complete')));
  });

  it("Should signup", () => {
    return request(app)
      .post("/signup")
      .send({
        username: 'ab@b.cl',
        password: '123'
      })
      .then((response) => {
        expect(response.body).toMatchObject({ user: { ...user, username: 'ab@b.cl', provider: 'password' }, accessToken: expect.any(String), refreshToken: expect.any(String) });
        expect(response.statusCode).toBe(200);
      });
  });

  it("Should not signup with registered user", () => {
    return request(app)
      .post("/signup")
      .send({
        username: 'a@b.cl',
        password: '123'
      })
      .then((response) => {
        expect(response.body.message).toBe("Username is already taken");
        expect(response.statusCode).toBe(403);
      });
  });

  it("Should signin", () => {
    return request(app)
      .post("/signin")
      .send({
        username: 'a@b.cl',
        password: '123'
      })
      .then((response) => {
        expect(response.body).toMatchObject({ user: { ...user, provider: 'password' }, accessToken: expect.any(String), refreshToken: expect.any(String) });
        expect(response.statusCode).toBe(200);
      });
  });

  it("Should not signin with wrong password", () => {
    return request(app)
      .post("/signin")
      .send({
        username: 'a@b.cl',
        password: '1234'
      })
      .then((response) => {
        expect(response.body.message).toBe("Password Incorrect");
        expect(response.statusCode).toBe(401);
      });
  });

  it("Should refresh", () => {
    return request(app)
      .get("/refresh")
      .set('Authorization', `Bearer ${userRefreshToken}`)
      .then((response) => {
        expect(response.body).toMatchObject({ user: { id: user.id, roles: user.roles, provider: 'password' }, accessToken: expect.any(String) });
        expect(response.statusCode).toBe(200);
      });
  });

  it("Should not refresh", () => {
    return request(app)
      .get("/refresh")
      .set('Authorization', `Bearer 1${userRefreshToken}`)
      .then((response) => {
        expect(response.body.message).toBe("Invalid refresh token");
        expect(response.statusCode).toBe(401);
      });
  });

  it("Should signout", () => {
    return request(app)
      .get("/signout")
      .set('Authorization', `Bearer ${userToken}`)
      .then((response) => {
        expect(response.body.message).toBe("Signed out successfully");
        expect(response.statusCode).toBe(200);
      });
  });

  //TODO: test facebook
});

