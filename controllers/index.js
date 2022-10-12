/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
// Handles request flow
// Never handles data logic
const models = require('../models/index');

exports.getReviews = (req, res) => {
  const page = Number(req.query.page) || 1;
  const count = Number(req.query.count) || 5;
  const sort = (!['newest', 'helpful', 'relevant'].includes(req.query.sort)) ? 'relevant' : req.query.sort;
  const productId = req.query.product_id;
  console.log(page, count, productId, sort);
  res.send('getReviews!!');
};

exports.getReviewsMeta = (req, res) => {
  const productId = req.query.product_id;
  res.send('getReviewsMeta!!');
};

exports.postReviews = (req, res) => {
};

exports.putReviewsHelpfulness = (req, res) => {

};

exports.putReviewsReport = (req, res) => {

};
