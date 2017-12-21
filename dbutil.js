"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _httpErrors = require("http-errors");

var _httpErrors2 = _interopRequireDefault(_httpErrors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//TODO: translate

exports.default = function (Model) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      perPage = _ref.perPage;

  return {
    findAll: function findAll(req, res, next) {
      Model.findAll().then(function (items) {
        res.result = items;
        next();
      }).catch(next);
    },
    findAllWhere: function findAllWhere() {
      var where = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {
        return {};
      };
      return function (req, res, next) {
        Model.findAll(where(req)).then(function (items) {
          res.result = items;
          next();
        }).catch(next);
      };
    },
    findOne: function findOne(req, res, next) {
      Model.findOne({
        where: {
          id: req.params.id
        }
      }).then(function (item) {
        if (!item) {
          throw new _httpErrors2.default.NotFound("Not found");
        }
        res.result = item;
        next();
      }).catch(next);
    },
    findOneWhere: function findOneWhere() {
      var where = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {
        return {};
      };
      return function (req, res, next) {
        var w = where(req);
        Model.findOne({
          where: _extends({
            id: req.params.id
          }, w)
        }).then(function (item) {
          if (!item) {
            throw new _httpErrors2.default.NotFound("Not found");
          }
          res.result = item;
          next();
        }).catch(next);
      };
    },
    create: function create(req, res, next) {
      Model.create(req.body).then(function (item) {
        res.result = item;
        res.status(201);
        next();
      }).catch(next);
    },
    update: function update(req, res, next) {
      //TODO: single update???
      Model.findOne({
        where: {
          id: req.params.id
        }
      }).then(function (item) {
        if (!item) {
          throw new _httpErrors2.default.NotFound("Can't update. Not Found");
        }
        return item;
      }).then(function (item) {
        return item.update(req.body);
      }).then(function (item) {
        res.result = item;
        next();
      }).catch(next);
    },
    updateWhere: function updateWhere() {
      var where = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {
        return {};
      };
      return function (req, res, next) {
        //TODO: single update???
        Model.findOne({
          where: _extends({
            id: req.params.id
          }, where)
        }).then(function (item) {
          if (!item) {
            throw new _httpErrors2.default.NotFound("Can't update. Not Found");
          }
          return item;
        }).then(function (item) {
          return item.update(req.body);
        }).then(function (item) {
          res.result = item;
          next();
        }).catch(next);
      };
    },
    destroy: function destroy(req, res, next) {
      Model.destroy({
        where: {
          id: req.params.id
        }
      }).then(function (item) {
        if (!item) {
          throw new _httpErrors2.default.NotFound("Not found");
        }
        res.result = item;
        next();
      }).catch(next);
    },
    userOwn: function userOwn(_ref2) {
      var id = _ref2.user.id;
      return { userId: id };
    }
  };
};