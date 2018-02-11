const HttpErrors = require('http-errors');
const {
  generateAccessToken,
  generateRefreshToken
} = require('./auth');

const userRole = 'user';
const user = { user: { id: 1, provider: 'password', roles: [ userRole ], }};

describe("Auth tests", () => {

  it("Should generate access token", () => {
    return new Promise((resolve, reject) => {
      generateAccessToken(user, {}, (result) => {
        expect(result).toBe(undefined);
        expect(user).toMatchObject({
          ...user,
          accessToken: expect.any(String)
        });
        resolve();
      })
    });
  });

  it("Should not generate access token", () => {
    return new Promise((resolve, reject) => {
      generateAccessToken({ user: { id: 1 }}, {}, (result) => {
        expect(result).toMatchObject(HttpErrors.BadRequest("Signature payload incomplete"));
        resolve();
      })
    });
  });

  it("Should generate refresh token", () => {
    return new Promise((resolve, reject) => {
      generateRefreshToken(user, {}, (result) => {
        expect(result).toBe(undefined);
        expect(user).toMatchObject({
          ...user,
          refreshToken: expect.any(String)
        });
        resolve();
      })
    });
  });

  it("Should not generate refresh token", () => {
    return new Promise((resolve, reject) => {
      generateRefreshToken({ user: { id: 1 }}, {}, (result) => {
        expect(result).toMatchObject(HttpErrors.BadRequest("Signature payload incomplete"));
        resolve();
      })
    });
  });

});