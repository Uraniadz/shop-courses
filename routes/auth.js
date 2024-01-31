const { Router } = require('express');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const crypto = require('node:crypto');
const keys = require('../keys/index');
const regEmail = require('../emails/registration');
const resetEmail = require('../emails/reset');
const User = require('../models/user');
const { registerValidators } = require('../utils/validators');
const router = Router();

const transporter = nodemailer.createTransport(
  sendgrid({
    auth: { api_key: keys.SENDGRID_API_KEY },
  })
);

router.get('/login', async (req, res) => {
  res.render('auth/login', {
    title: 'Авторизація',
    isLogin: true,
    loginError: req.flash('loginError'),
    registerError: req.flash('registerError'),
  });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const candidate = await User.findOne({ email });
    if (candidate) {
      const areSame = await bcrypt.compare(password, candidate.password);
      if (areSame) {
        const user = candidate;
        req.session.user = user;
        req.session.isAuthentificated = true;
        req.session.save((err) => {
          if (err) {
            console.log(err);
          }
          res.redirect('/');
        });
      } else {
        req.flash('loginError', 'Невірний пароль');
        res.redirect('/auth/login#login');
      }
    } else {
      req.flash('loginError', 'Такого користувача не існує');
      res.redirect('/auth/login#login');
    }
  } catch (err) {
    console.log(err);
  }
});

router.get('/logout', async (req, res) => {
  // перший варіант
  // req.session.isAuthentificated = false;
  // res.redirect('/');
  // другий варіант
  req.session.destroy(() => {
    res.redirect('/auth/login#login');
  });
});

router.post('/register', registerValidators, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    // const candidate = await User.findOne({ email });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('registerError', errors.array()[0].msg);
      return res.status(422).redirect('/auth/login#register');
    }

    // if (candidate) {
    //   req.flash('registerError', 'Користувач з таким email вже існує');
    //   res.redirect('/auth/login#register');
    // } else {
    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      name,
      password: hashPassword,
      cart: { items: [] },
    });
    await user.save();
    await transporter.sendMail(regEmail(email));
    res.redirect('/auth/login#login');
    // }
  } catch (err) {
    console.log(err);
  }
});

router.get('/reset', (req, res) => {
  res.render('auth/reset', {
    title: 'Забули пароль?',
    error: req.flash('error'),
  });
});

router.post('/reset', (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        console.log(err);
        req.flash('error', 'Упс, щось пішло не так, повторіть спробу пізніше.');
        return res.redirect('/auth/reset');
      }
      const token = buffer.toString('hex');
      const candidate = await User.findOne({ email: req.body.email });
      if (candidate) {
        candidate.resetToken = token;
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
        await candidate.save();
        await transporter.sendMail(resetEmail(candidate.email, token));
        res.redirect('/auth/login');
      } else {
        req.flash('error', 'Такого email не має');
        res.redirect('auth/reset');
      }
    });
  } catch (err) {
    console.log(err);
  }
});

// потрібно максимальна захистити
router.get('/password/:token', async (req, res) => {
  if (!req.params.token) {
    return res.redirect('/auth/login');
  }
  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExp: { $gt: Date.now() }, // умова $gt не має бути більшою за Date.now()
    });
    if (!user) {
      return res.redirect('auth/login');
    } else {
      res.render('auth/password', {
        title: 'Відновити пароль',
        error: req.flash('error'),
        userId: user._id.toString(),
        token: req.params.token,
      });
    }
  } catch (err) {
    console.log(err);
  }
});

router.post('/password', async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.body.userId,
      resetToken: req.body.token,
      resetTokenExp: { $gt: Date.now() },
    });
    if (user) {
      user.password = await bcrypt.hash(req.body.password, 10);
      user.resetToken = undefined;
      user.resetTokenExp = undefined;
      await user.save();
      res.redirect('/auth/login');
    } else {
      req.flash('loginError', 'Період часу token вичерпалося');
      res.redirect('/auth/login');
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
