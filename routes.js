require('dotenv').config();
const express = require('express');

const loader = process.env.LOADER;
const router = express.Router();
const {
  getReviews,
  getReviewsMeta,
  postReviews,
  putReviewsHelpfulness,
  putReviewsReport,
  getLoaderToken,
} = require('./controllers');

router.route('/reviews').get(getReviews);
router.route('/reviews/meta').get(getReviewsMeta);
router.route('/reviews').post(postReviews);
router.route('/reviews/:review_id/helpful').put(putReviewsHelpfulness);
router.route('/reviews/:review_id/report').put(putReviewsReport);
router.route(`/${loader}`).get(getLoaderToken);

module.exports = router;
