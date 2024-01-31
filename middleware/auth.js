module.exports = function (req, res, next) {
  if (!req.session.isAuthentificated) {
    return res.redirect('/auth/login');
  }
  next();
};
