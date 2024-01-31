const { body } = require('express-validator');
const User = require('../models/user');
module.exports.registerValidators = [
  body('email')
    .isEmail()
    .withMessage('Введіть коректну email')
    .custom(async (value, { req }) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject('Такий email вже занятий');
        }
      } catch (err) {
        console.log(err);
      }
    })
    .normalizeEmail(),
  body('password', 'Пароль має бути не менше 6 символів')
    .isLength({ min: 6, max: 56 })
    .isAlphanumeric()
    .trim(),
  body('confirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Паролі мають співпадати');
      }
      return true;
    })
    .trim(),
  body('name')
    .isLength({ min: 3, max: 56 })
    .withMessage('Ім\nя має складатися мінімум з 3 символів')
    .trim(),
];

module.exports.courseValidators = [
  body('title')
    .isLength({ min: 3 })
    .withMessage('Мінімальна назва 3 символи')
    .trim(),
  body('price').isNumeric().withMessage('Введіть коректну ціну'),
  body('img', 'Введіть коректний url малюнка').isURL(),
];
