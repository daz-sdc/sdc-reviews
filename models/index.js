/* eslint-disable no-unused-vars */
// Handles data logic
// Interacts with database
const db = require('../db/index');

exports.getReviews = (id) => {
  const text = `SELECT review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness
                FROM reviews
                WHERE $1::integer IS NULL or product = $1::integer`;
  const params = [id];
  return db.query(text, params);
};

// test1:
// const text = `SELECT r.product, r.helpfulness, rp.photo_id, rp.url, rp.review_id FROM reviews as r JOIN reviews_photos as rp ON r.id = rp.review_id WHERE $1 IS NULL or r.product = $1`;

// test2:
// const text = `SELECT rp.review_id, r.rating, r.summary, r.recommend, r.response, r.body, r.date, r.reviewer_name, r.helpfulness, rp.photo_id, rp.url FROM reviews r JOIN reviews_photos as rp ON r.id = rp.review_id WHERE $1::integer IS NULL or r.product = $1::integer`;

// original:
// const text = `SELECT r.product, r.rating, r.summary, r.recommend, r.response, r.body, r.date, r.reviewer_name, r.helpfulness, rp.photo_id, rp.url, rp.review_id FROM reviews r JOIN reviews_photos as rp ON r.id = rp.review_id WHERE $1::integer IS NULL or r.product = $1::integer`;

exports.getPhotos = (reviewId) => {
  const text = `SELECT id, url
                From reviews_photos
                WHERE $1::integer IS NULL or review_id = $1::integer`;
  const params = [reviewId];
  return db.query(text, params);
};
