/* eslint-disable no-unused-vars */
// Handles data logic
// Interacts with database
const db = require('../db/index');

exports.getReviewsHelpful = (id, count, page) => {
  const text = `SELECT review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness
                FROM reviews
                WHERE $1::integer IS NULL or product = $1::integer
                ORDER BY helpfulness DESC
                LIMIT $2
                OFFSET ($3 - 1) * $2`;
  const params = [id, count, page];
  return db.query(text, params);
};

exports.getReviewsNewest = (id, count, page) => {
  const text = `SELECT review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness
                FROM reviews
                WHERE $1::integer IS NULL or product = $1::integer
                ORDER BY date DESC
                LIMIT $2
                OFFSET ($3 - 1) * $2`;
  const params = [id, count, page];
  return db.query(text, params);
};

exports.getReviewsRelevant = (id, count, page) => {
  const text = `SELECT review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness
                FROM reviews
                WHERE $1::integer IS NULL or product = $1::integer
                ORDER BY
                CASE WHEN (date_part('year', (SELECT current_timestamp)) - EXTRACT(YEAR FROM date) <= 2)
                     THEN helpfulness END DESC,
                CASE WHEN (date_part('year', (SELECT current_timestamp)) - EXTRACT(YEAR FROM date) > 2)
                     THEN date END DESC
                LIMIT $2
                OFFSET ($3 - 1) * $2`;
  const params = [id, count, page];
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
