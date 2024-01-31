const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    requied: true,
  },
  name: String,
  password: {
    type: String,
    requied: true,
  },
  resetToken: String,
  resetTokenExp: Date,
  avatarUrl: String,
  cart: {
    items: [
      {
        count: {
          type: Number,
          requied: true,
          default: 1,
        },
        courseId: {
          type: Schema.Types.ObjectId,
          ref: 'Course', // має співпадати назва з функцією model 'Course' in models course.js
          requied: true,
        },
      },
    ],
  },
});
// warning!!! Важливо використовувати слово function
userSchema.methods.addToCart = function (course) {
  const items = [...this.cart.items];
  const idx = items.findIndex(
    (c) => c.courseId.toString() === course._id.toString()
  );
  if (idx >= 0) {
    items[idx].count = items[idx].count + 1;
  } else {
    items.push({
      courseId: course._id,
      count: 1,
    });
    this.cart = { items };
  }
  return this.save();
};

userSchema.methods.removeFromCart = function (id) {
  try {
    let items = [...this.cart.items];
    const idx = items.findIndex((c) => c.courseId.toString() === id.toString());

    if (items[idx].count === 1) {
      items = items.filter((c) => c.courseId.toString() !== id.toString());
    } else {
      items[idx].count -= 1;
    }
    this.cart = { items };
    return this.save();
  } catch (err) {
    console.log(err);
  }
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

module.exports = model('User', userSchema);
