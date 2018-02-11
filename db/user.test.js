const db = require('./index');
const { User, Role } = db;

describe("Auth router tests", () => {

  beforeAll(() => {
    console.log('sync?');
    return db.sync({ force: true })
      .then(() => Role.create({ role: 'user' }));
  });

  it("Should signup", async () => {
    const user = {
      username: 'a@b.cl',
      password: '123',
      email: 'a@b.cl'
    };

    const newUser = await User.register(user);
    expect(newUser.toJSON()).toMatchObject({
      username: 'a@b.cl',
      authProviders: undefined,
      contacts: [
        expect.objectContaining({
          contact: 'a@b.cl',
          kind: 'email'
        })
      ],
      emails: ["a@b.cl"],
      password: undefined,
      roles: ["user"],
    });

  });

  it("Should register facebook", async () => {

    const fbUser = await User.facebookCreate({
      username: 'a@b.cl',
      email: 'a@b.cl',
      id: '123123123'
    });

    expect(fbUser.toJSON()).toMatchObject({
      authProviders: undefined,
      contacts: [
        expect.objectContaining({
          contact: "a@b.cl"
        })
      ],
      deletedAt: null,
      emails: ["a@b.cl"],
      id: expect.any(Number),
      password: undefined,
      roles: ["user"],
      username: "a@b.cl"
    });

  });
});