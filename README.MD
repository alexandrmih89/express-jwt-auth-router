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

const User = configureUser(db, acl, (User) => {
  //User.hasMany();
});

export default User;
```

Join it up:
```
import User from './db/User';
import db from './db/db';
import apiRouter from './api';
import anyOtherRouter from './api';
import server from 'express-jwt-auth-router'

const { app, startServer } = server(db, {
  loginQuery: User.login,
  registerQuery: User.register,
  mountPoint: '/api/v1' //optional
  apiRouter //optional, will be mounted at mount point
});

app.use(anyOtherRouter); //do whatever you want with your express app

startServer();
```

Use ACL:
```
import acl from './acl';

acl.allow('user', 'orders', 'get');

app.get('/orders', acl.can('orders:get'), (req, res, next) => {
    res.send('OK!');
})
```