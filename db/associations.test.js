import db from './db';
import User from './User';
import './associations';

describe("Association tests", () => {

  const userData = {
    username: 'a@b.cl',
    email: 'a@b.cl'
  };

  const expectedObject = {
    username: userData.username,
    roles: [ 'user' ],
    emails: [ 'a@b.cl' ]
  };

  let user;

  beforeAll(async () => {
    await db.sync({ force: true });
    console.warn('DB sync complete');
    user = await User.register(userData);
  });

  it("User should have roles, emails and profile in default scope", async (done) => {

    const userWithRoles = await User.findById(user.id);

    expect(userWithRoles.toJSON()).toMatchObject(expectedObject);

    done();
  });



});
