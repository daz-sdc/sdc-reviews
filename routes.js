/* eslint-disable import/newline-after-import */
/* eslint-disable no-unused-vars */
const express = require('express');
require('dotenv').config();
const loader = process.env.LOADER;
const router = express.Router();
const {
  getReviews,
  getReviewsMeta,
  postReviews,
  putReviewsHelpfulness,
  putReviewsReport,
  getLoaderToken,
} = require('./controllers/index');

router.route('/reviews').get(getReviews);
router.route('/reviews/meta').get(getReviewsMeta);
router.route('/reviews').post(postReviews);
// router.post('/reviews', postReviews);
router.route('/reviews/:review_id/helpful').put(putReviewsHelpfulness);
router.route('/reviews/:review_id/report').put(putReviewsReport);
router.route(`/${loader}`).get(getLoaderToken);

module.exports = router;
