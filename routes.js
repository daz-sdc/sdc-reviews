/* eslint-disable import/newline-after-import */
/* eslint-disable no-unused-vars */
const express = require('express');
const router = express.Router();
const {
  getReviews,
  getReviewsMeta,
  postReviews,
  putReviewsHelpfulness,
  putReviewsReport,
} = require('./controllers/index');

router.route('/reviews').get(getReviews);
router.route('/reviews/meta').get(getReviewsMeta);
router.route('/reviews').post(postReviews);
// router.post('/reviews', postReviews);
router.route('/reviews/:review_id/helpful').put(putReviewsHelpfulness);
router.route('/reviews/:review_id/report').put(putReviewsReport);

module.exports = router;
