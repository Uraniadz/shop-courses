const { Router } = require('express');
const Order = require('../models/order.js');
const auth = require('../middleware/auth.js');

const router = Router();

router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ 'user.userId': req.user._id }).populate(
      'user.userId'
    );

    res.render('orders', {
      isOrder: true,
      title: 'Замовлення',
      orders: orders.map((ord) => {
        // console.log(ord);
        return {
          ...ord._doc,
          count: ord.courses.map((ct) => {
            return ct.count;
          }),
          title: ord.courses.map((c) => {
            return c.course.title;
          }),
          price: ord.courses.reduce(
            (acc, value) => (acc += value.count * value.course.price),
            0
          ),
        };
      }),
    });
  } catch (err) {
    console.log(err);
  }
});

router.post('/', auth, async (req, res) => {
  const user = await req.user.populate('cart.items.courseId');
  const courses = user.cart.items.map((i) => ({
    count: i.count,
    course: { ...i.courseId._doc },
  }));

  const order = new Order({
    user: {
      name: req.user.name,
      // email: req.user.email,
      userId: req.user,
    },
    courses,
  });
  await order.save();
  await req.user.clearCart();
  res.redirect('/orders');
});

module.exports = router;
