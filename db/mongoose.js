/* eslint-disable no-use-before-define */
/* eslint-disable comma-dangle */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line import/newline-after-import
const mongoose = require('mongoose');
const { Schema } = mongoose;

const metaSchema = new Schema({
  product_id: Number,
  characteristics: [{
    char_id: Number,
    char_value: String
  }],
  reviews: [reviewSchema]
});

const reviewSchema = new Schema({
  review_id: Number,
  rating: Number,
  summary: String,
  recommended: Boolean,
  body: String,
  date: Date,
  reviewer_name: String,
  reviewer_email: String,
  helpfulness: Number,
  photos: [{
    photo_id: Number,
    photo_url: String
  }]
});
