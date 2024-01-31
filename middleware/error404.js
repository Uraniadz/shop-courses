module.exports = function (req, res, next) {
  res.status(404).render('error-404', {
    title: 'Сторінка не знайдена',
  });
};
