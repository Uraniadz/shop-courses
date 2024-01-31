const keys = require('../keys/index');

module.exports = function (email) {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: 'Акаунт створений',
    html: `
    <h1>Раді бачити вас в нашому магазині</h1>
    <p>Вітаємо! Реєстрація прошйла успішно. Ваш акаунт створений на email: ${email}</p>
    <hr />
    <a href="${keys.BASE_URL}">Магазин курсів</a>
    
    `,
  };
};
