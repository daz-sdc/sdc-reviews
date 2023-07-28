const models = require('../models/index');
require('dotenv').config();

const loader = process.env.LOADER;

exports.getLoaderToken = (req, res) => {
  res.status(200).send(loader);
};

exports.getReviews = async function getReviews(req, res) {
  const page = Number(req.query.page) || 1;
  const count = Number(req.query.count) || 5;
  const sort = (!['newest', 'helpful', 'relevant'].includes(req.query.sort)) ? 'relevant' : req.query.sort;
  const productId = req.query.product_id;
  const output = {
    product: productId,
    page,
    count,
  };

  let reviews;

  try {
    if (sort === 'helpful') {
      reviews = await models.getReviewsHelpful(productId, count, page);
    } else if (sort === 'newest') {
      reviews = await models.getReviewsNewest(productId, count, page);
    } else {
      reviews = await models.getReviewsRelevant(productId, count, page);
    }

    Promise.all(reviews.rows).then((bigBox) => {
      output.results = bigBox;
      res.send(output);
    });
  } catch (e) {
    res.send(e);
  }
};

exports.getReviewsMeta = async function getReviewsMeta(req, res) {
  const productId = req.query.product_id;
  const arr = await models.getReviewsMeta(productId);
  const output = {
    product_id: productId,
  };
  Object.assign(output, arr.rows[0]);
  res.send(output);
};

exports.postReviews = (req, res) => {
  models.postReviews(req.body)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(501).send(err);
    });
};

exports.putReviewsHelpfulness = (req, res) => {
  models.putReviewsHelpfulness(req.body)
    .then((data) => {
      res.status(204).send(data);
    })
    .catch((err) => {
      res.status(501).send(err);
    });
};

exports.putReviewsReport = (req, res) => {
  models.putReviewsReport(req.body)
    .then((data) => {
      res.status(204).send(data);
    })
    .catch((err) => {
      res.status(501).send(err);
    });
};
