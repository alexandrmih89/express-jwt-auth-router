import HttpError from 'http-errors';

//TODO: translate

export default (Model, {
  perPage
} = {}) => ({
  findAll: (req, res, next) => {
    Model.findAll()
      .then(items => {
        res.result = items;
        next();
      })
      .catch(next);
  },
  findAllWhere: (where = () => ({})) => (req, res, next) => {
    Model.findAll(where(req))
      .then(items => {
        res.result = items;
        next();
      })
      .catch(next);
  },
  findOne: (req, res, next) => {
    Model.findOne({
      where: {
        id: req.params.id
      }
    })
      .then(item => {
        if(!item) {
          throw new HttpError.NotFound("Not found")
        }
        res.result = item;
        next();
      })
      .catch(next);
  },
  findOneWhere: (where = () => ({})) => (req, res, next) => {
    const w = where(req);
    Model.findOne({
      where: {
        id: req.params.id,
        ...w
      }
    })
      .then(item => {
        if(!item) {
          throw new HttpError.NotFound("Not found")
        }
        res.result = item;
        next();
      })
      .catch(next);
  },
  create: (req, res, next) => {
    Model.create(req.body)
      .then(item => {
        res.result = item;
        res.status(201);
        next();
      })
      .catch(next);
  },
  update: (req, res, next) => {
    //TODO: single update???
    Model.findOne({
      where: {
        id: req.params.id
      }
    })
      .then(item => {
        if(!item) {
          throw new HttpError.NotFound("Can't update. Not Found")
        }
        return item;
      })
      .then(item => item.update(req.body))
      .then(item => {
        res.result = item;
        next();
      })
      .catch(next);
  },
  updateWhere: (where = () => ({})) => (req, res, next) => {
    //TODO: single update???
    Model.findOne({
      where: {
        id: req.params.id,
        ...where,
      }
    })
      .then(item => {
        if(!item) {
          throw new HttpError.NotFound("Can't update. Not Found")
        }
        return item;
      })
      .then(item => item.update(req.body))
      .then(item => {
        res.result = item;
        next();
      })
      .catch(next);
  },
  destroy: (req, res, next) => {
    Model.destroy({
      where: {
        id: req.params.id
      }
    })
      .then(item => {
        if(!item) {
          throw new HttpError.NotFound("Not found")
        }
        res.result = item;
        next();
      })
      .catch(next);
  },
  userOwn: ({ user: { id } }) => ({ userId: id })
});