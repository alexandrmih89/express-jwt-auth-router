Start from db:

db/db.js
```
import { Sequelize } from '../lib/db/db';
import db from '../lib/db';

export default db;

export {
  Sequelize
}
```

import models you will extend or scope or associate:
db/index.js
```javascript
import User from 'lib/db/User'; //lib model
import UserInfo from './UserInfo'; //custom model associated with User
import File from './File'; //custom model

export {
  User,
  UserInfo,
  File
}
```

configure protected routers (Use ACL)
```javascript
import express from 'express';
import DBUtil from '../../lib/dbutil'
import Store from '../../db/Store';
import acl from '../../lib/ACL';

const storesRouter = express.Router();

const resource = 'stores';

const dbu = DBUtil(Store);

acl.allow('user', resource, 'get');
storesRouter.get('/', acl.canMiddleware(`${resource}:get` ), dbu.findAll);

storesRouter.get('/:id', acl.canMiddleware(`${resource}:get`), dbu.findOne);

acl.allow('user', resource, 'create');
storesRouter.post('/', acl.canMiddleware(`${resource}:create`), dbu.create);

acl.allow('user', resource, 'edit');
storesRouter.put('/:id', acl.canMiddleware(`${resource}:edit`), dbu.updateWhere(dbu.userOwn));

storesRouter.delete('/:id', (req, res, next) => {
  //Delete store
  next();
});

export default storesRouter;
```

Join it up:
```javascript
import express from 'express';
import staticRouter from './routes/static/static';

//lib imports
import { User } from './db';
import passport from './lib/util/passport';
import { applyStrategies } from './lib/auth';
import authRouter from './lib/authRouter';

const app = express();

applyStrategies(passport, {
  loginQuery: User.login, //a function accepting User (from request) and returning a promise (usually db call) which should return User or throw error
  registerQuery: User.register, // (User, userRole = 'user') => Promise; a function accepting User and returning a promise (usually db call), to check if user exists, and then refister if not. Should return User or throw error
  fbUserQuery: User.checkFBUser, // accepts fbProfile._json, returns a Promise with user formatted (usually db call), or null if nothing found. Should omit password and other sensitive data.
  fbCreateUser: User.createFBUser, // (User, userRole = 'user') => Promise; creates FB profile user
  fbProfileFields, //  facebook profile fields. By default: [ 'id', 'email', 'displayName', 'gender', 'picture', 'age_range', 'cover', 'link', 'locale', 'timezone', 'updated_time', 'verified']
});


app.use(staticRouter);
app.use('/api/v1/', authRouter);
app.use('/api/v1/stores/', storesRouter);

```

User data (request):

To create a user with role need to use acl and set the roles in registerQuery and fbCreateUser.