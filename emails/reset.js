const keys = require('../keys/index');

module.exports = function (email, token) {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: 'Відновлення доступу',
    html: `
        <h1>Ви забули пароль?</h1>
        <p>Якщо ні, то проігноруйте даний лист</p>
        <p>В іншому випадуку натисніть на посилання знизу:</p>
        <p><a href="${keys.BASE_URL}/auth/password/${token}">Відновити доступ</a></p>
        <hr />
        <a href="${keys.BASE_URL}">Магазин курсів</a>
        
        `,
  };
};
