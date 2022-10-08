/* eslint-disable no-unused-vars */
// Hndles request flow
// Never handles data logic
exports.getReviews = (req, res) => {
  console.log(req.query.product_id);
  res.send('OK!!');
};


exports.getReviewsMeta = (req, res) => {

};

exports.postReviews = (req, res) => {

};

exports.putReviewsHelpfulness = (req, res) => {

};

exports.putReviewsReport = (req, res) => {

};
