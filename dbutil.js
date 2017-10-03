import HttpError from 'http-errors';

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
  create: (req, res, next) => {
    Model.create(req.body)
      .then(item => {
        res.result = item;
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
      .then(item => item.update(req.body))
      .then(item => {
        res.result = item;
        next();
      })
      .catch(next);
  }
});