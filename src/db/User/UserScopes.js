import User from './User';
import Role from '../Role/Role';
import Contact from '../Contact/Contact';

User.addScope('defaultScope', {
  include: [{
    model: Role,
    as: 'roles'
  }, {
    model: Contact,
    as: 'contacts'
  }, {
    model: Contact,
    as: 'emails',
    where: {
      kind: 'email'
    },
    required: false
  }],
}, {
  override: true
});