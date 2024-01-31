const { Router } = require('express');
const { validationResult } = require('express-validator');
const Course = require('../models/course.js');
const auth = require('../middleware/auth.js');
const { courseValidators } = require('../utils/validators.js');

const router = Router();

function isOwner(course, req) {
  return course.userId.toString() === req.user._id.toString();
}

router.get('/', async (req, res) => {
  //training mongoose start
  // метод populate('some user or something'), другим параметром приймає метод select('email name)
  // select('img title') - відбирає ті дані які нам необхідні
  //end
  try {
    const courses = await Course.find().populate('userId', 'email name').lean();
    console.log(req.user);

    res.render('courses', {
      title: 'Курси',
      isCourses: true,
      userId: req.user ? req.user._id.toString() : null,
      courses,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get('/:id/edit', auth, async (req, res) => {
  if (!req.query.allow) {
    return res.redirect('/');
  }

  try {
    const course = await Course.findById(req.params.id).lean();

    if (!isOwner(course, req)) {
      return res.redirect('/courses');
    }
    res.render('course-edit', {
      title: `Редагувати ${course.title}`,
      course,
    });
  } catch (err) {
    console.log(err);
  }
});

router.post('/edit', auth, courseValidators, async (req, res) => {
  const { _id } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // return res.status(422).redirect(`/courses/${_id}/edit?allow=true`);
    return res.status(422).render('add', {
      title: 'Редагувати курс',
      isCourses: true,
      error: errors.array()[0].msg,
      data: {
        title: req.body.title,
        price: req.body.price,
        img: req.body.img,
      },
    });
  }
  try {
    delete req.body.id;
    const course = await Course.findById(_id);
    if (!isOwner(course, req)) {
      return res.redirect('/courses');
    }
    Object.assign(course, req.body);
    await course.save();
    // await Course.findByIdAndUpdate(_id, req.body).lean();
    res.redirect('/courses');
  } catch (err) {
    console.log(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).lean();
    res.render('course', {
      layout: 'empty',
      title: `Курс ${course.title}`,
      course,
    });
  } catch (err) {
    console.log(err);
  }
});

router.post('/remove', auth, async (req, res) => {
  res.redirect('/courses');
  try {
    await Course.deleteOne({
      _id: req.body._id,
      userId: req.user._id,
    }).lean();
    res.redirect('/courses');
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
