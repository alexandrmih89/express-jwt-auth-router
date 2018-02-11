const User = require('./User');
const Role = require('../Role/Role');
const Contact = require('../Contact/Contact');

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