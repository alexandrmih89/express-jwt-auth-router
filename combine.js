export default function (list) {
  return function (req, res, next) {
    (function iter(i) {
      var mid = list[i];
      if (!mid) return next();
      mid(req, res, function (err) {
        if (err) return next(err);
        iter(i+1)
      })
    }(0))
  }
}