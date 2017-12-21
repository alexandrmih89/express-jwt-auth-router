'use strict';

var _db = require('./db');

var _db2 = _interopRequireDefault(_db);

var _User = require('./User');

var _User2 = _interopRequireDefault(_User);

require('./associations');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

describe("Association tests", function () {

  var userData = {
    username: 'a@b.cl',
    email: 'a@b.cl'
  };

  var expectedObject = {
    username: userData.username,
    roles: ['user'],
    emails: ['a@b.cl']
  };

  var user = void 0;

  beforeAll(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return _db2.default.sync({ force: true });

          case 2:
            console.warn('DB sync complete');
            _context.next = 5;
            return _User2.default.register(userData);

          case 5:
            user = _context.sent;

          case 6:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  })));

  it("User should have roles, emails and profile in default scope", function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(done) {
      var userWithRoles;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _User2.default.findById(user.id);

            case 2:
              userWithRoles = _context2.sent;


              expect(userWithRoles.toJSON()).toMatchObject(expectedObject);

              done();

            case 5:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, undefined);
    }));

    return function (_x) {
      return _ref2.apply(this, arguments);
    };
  }());
});