// Handles data logic
// Interacts with database
const db = require('../db/index');

exports.getReviews = () => {
  const text = `SELECT r.product, r.rating, r.summary, r.recommend, r.response, r.body, r.date,
   r.reviewer_name, r.helpfulness, rp.photo_id, rp.url, rp.review_id
  FROM reviews r JOIN reviews_photos as rp ON r.id = rp.review_id WHERE r.product = $71702`;
  return db.query();
};
