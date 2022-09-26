/* eslint-disable comma-dangle */
/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');

const metaSchema = mongoose.Schema({
  product_id: Number,
  recommended: Number,
  not_recommended: Number,
  rating: Number,
  characteristic_id: Number,
  characteristic_value: Number
});

const reviewSchema = mongoose.Schema({
  product_id: Number,
  review_id: Number,
  rating: Number,
  summary: String,
  recommended: Boolean,
  body: String,
  date: Date,
  reviewer_name: String,
  reviewer_email: String,
  helpfulness: Number
});

const photoSchema = mongoose.Schema({
  review_id: Number,
  photo_id: Number,
  photo_url: String
});
