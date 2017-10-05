Start from db:

db/db.js
```
import Sequelize from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

export default new Sequelize(process.env.DB_URL);
```

Configure acl:
```
import ACL from 'express-jwt-auth-router/ACL';
import db from './db';

const acl = ACL(db);

export default acl;
```

USERS are configured separately:
```
import db from './db';
import acl from './acl';
import configureUser from 'express-jwt-auth-router/User';

const { User, Role } = configureUser(db, acl, ({ User, Role }) => {
  //User.hasMany();
});

export default User;

export { Role };
```

Join it up:
```
import User from './db/User';
import db from './db/db';
import apiRouter from './api';
import anyOtherRouter from './api';
import server from 'express-jwt-auth-router'

const { app, startServer } = server(db, {
  loginQuery: User.login, //a function accepting User (from request) and returning a promise (usually db call) which should return User or throw error
  registerQuery: User.register, // (User, userRole = 'user') => Promise; a function accepting User and returning a promise (usually db call), to check if user exists, and then refister if not. Should return User or throw error
  fbUserQuery: User.checkFBUser, // accepts fbProfile._json, returns a Promise with user formatted (usually db call), or null if nothing found. Should omit password and other sensitive data.
  fbCreateUser User.createFBUser, // (User, userRole = 'user') => Promise; creates FB profile user
  apiRouter //optional, will be mounted at mount point
  mountPoint: '/api/v1' //optional - route to mount
  fbProfileFields, //  facebook profile fields. By default: [ 'id', 'email', 'displayName', 'gender', 'picture', 'age_range', 'cover', 'link', 'locale', 'timezone', 'updated_time', 'verified']
});

app.use(anyOtherRouter); //do whatever you want with your express app

startServer();
```

Use ACL:
```
import acl from './acl';

acl.allow('user', 'orders', 'get');

app.get('/orders', acl.canMiddleware('orders:get'), (req, res, next) => {
    res.send('OK!');
})
```

User data (request):

To create a user with role need to use acl and set the roles in registerQuery and fbCreateUser.
