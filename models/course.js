const { Schema, model } = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const course = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  img: String,
  count: Number,
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

module.exports = model('Course', course);
