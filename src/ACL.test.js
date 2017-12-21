import HttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import acl from './ACL';
import './util/dotenv';

const jwtSecret = process.env.JWT_SECRET;

const adminRole = process.env.ADMIN_ROLE || 'admin';
const userRole = 'user';

const user = { user: { id: 1, provider: 'password', roles: [ userRole ], }};
const admin = { user: { id: 2, provider: 'password', roles: [ adminRole ], }};
const userJWT = acl.signAccessToken(user);
const adminJWT = acl.signAccessToken(admin);
const adminJWTRefresh = acl.signRefreshToken(admin);


describe("ACL tests", () => {

  beforeAll(() => {
    return acl.allow('user', 'stores', 'get');
  });

  it("Should be authorized for user to get stories", () => {
    const isAuthorized = acl.isAuthorized('stores:get');
    return new Promise((resolve, reject) => {
      isAuthorized(user, {}, (result) => {
        expect(result).toBe(undefined);
        resolve();
      })
    });
  });

  it("Should not be authorized for user to edit stories", () => {
    const isAuthorized = acl.isAuthorized('stores:edit');
    return new Promise((resolve, reject) => {
      isAuthorized(user, {}, (result) => {
        expect(result).toMatchObject(new HttpError.Forbidden("Permission denied"));
        resolve();
      })
    });
  });

  it("Should be authorized for admin to edit stories", () => {
    const isAuthorized = acl.isAuthorized('stores:edit');
    return new Promise((resolve, reject) => {
      isAuthorized(admin, {}, (result) => {
        expect(result).toBe(undefined);
        resolve();
      })
    });
  });

  it("Should be authenticated user", () => {
    return new Promise((resolve, reject) => {
      acl.isAuthenticated({ headers: { authorization: `Bearer ${userJWT}` }}, {}, (result) => {
        expect(result).toBe(undefined);
        resolve();
      })
    });
  });

  it("Should not be authenticated user", () => {
    return new Promise((resolve, reject) => {
      acl.isAuthenticated({ headers: { authorization: `Bearer 1${userJWT}` }}, {}, (result) => {
        expect(result).toMatchObject(HttpError.Unauthorized("invalid token"));
        resolve();
      })
    });
  });

  it("Should allow user to get stories", () => {
    return new Promise((resolve, reject) => {
      const canMiddleware = acl.canMiddleware('stores:get');
      canMiddleware({ headers: { authorization: `Bearer ${userJWT}` }}, {}, (result) => {
        //expect(result).toMatchObject(HttpError.Unauthorized("Invalid token"));
        expect(result).toBe(undefined);
        resolve();
      })
    });
  });

  it("Should not allow user to edit stories", () => {
    return new Promise((resolve, reject) => {
      const canMiddleware = acl.canMiddleware('stores:edit');
      canMiddleware({ headers: { authorization: `Bearer ${userJWT}` }}, {}, (result) => {
        expect(result).toMatchObject(HttpError.Forbidden("Permission denied"));
        resolve();
      })
    });
  });

  it("Should allow admin to edit stories", () => {
    return new Promise((resolve, reject) => {
      const canMiddleware = acl.canMiddleware('stores:edit');
      canMiddleware({ headers: { authorization: `Bearer ${adminJWT}` }}, {}, (result) => {
        expect(result).toBe(undefined);
        resolve();
      })
    });
  });

  it("Should verify refresh token", () => {
    return new Promise((resolve, reject) => {
      acl.isRefreshTokenValid({ headers: { authorization: `Bearer ${adminJWTRefresh}` }}, {}, (result) => {
        expect(result).toBe(undefined);
        resolve();
      })
    });
  });

  it("Should reject invalid refresh token", () => {
    return new Promise((resolve, reject) => {
      acl.isRefreshTokenValid({ headers: { authorization: `Bearer ${adminJWT}` }}, {}, (result) => {
        expect(result).toMatchObject(HttpError.Unauthorized("Invalid refresh token"));
        resolve();
      })
    });
  });

  it("Should reject invalid accept token", () => {
    return new Promise((resolve, reject) => {
      acl.isAuthenticated({ headers: { authorization: `Bearer ${adminJWTRefresh}` }}, {}, (result) => {
        expect(result).toMatchObject(HttpError.Unauthorized("Invalid access token"));
        resolve();
      })
    });
  });

  it("Should sign access token", (done) => {
    const token = acl.signAccessToken(user);
    expect(jwt.verify(token, jwtSecret)).toMatchObject({
      id: 1,
      roles: [ 'user' ],
      exp: expect.any(Number),
      iat: expect.any(Number),
      provider: 'password',
      //device: expect.any(String),
      //api: 'v1'
    });
    done();
  });

  it("Should not sign access token with incomplete data", (done) => {
    expect(() => acl.signAccessToken({ user: { id: 1, provider: 'password', }}))
      .toThrowError(HttpError.BadRequest("Signature payload incomplete"));
    done();
  })

  //TODO: check blacklist
});
