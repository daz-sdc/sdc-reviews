const models = require('../models');
require('dotenv').config();
const loader = process.env.LOADER;
const Redis = require('redis');
let redisClient;

(async () => {
  redisClient = Redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
  });
  redisClient.on('error', err => console.log('Redis Client Error', err));
  await redisClient.connect();
})();

async function cacheDataReviews(req, res, next) {
  const product = req.query.product_id;
  const page = Number(req.query.page) || 1;
  const count = Number(req.query.count) || 5;
  const sort = (!['newest', 'helpful', 'relevant'].includes(req.query.sort)) ? 'relevant' : req.query.sort;

  try {
    const cacheResult = await redisClient.get(String(product));
    const parseCacheResult = JSON.parse(cacheResult);
    if (cacheResult && parseCacheResult['page'] === page && parseCacheResult['count'] === count && parseCacheResult['sort'] === sort) {
      res.status(200).send(parseCacheResult);
    } else {
      next();
    }
  } catch (e) {
    console.log(e);
  }
}

async function helper(product, count, page, sort) {
  const output = { product, page, count, sort};
  let reviews;

  try {
    if (sort === 'helpful') {
      reviews = await models.getReviewsHelpful(product, count, page);
    } else if (sort === 'newest') {
      reviews = await models.getReviewsNewest(product, count, page);
    } else {
      reviews = await models.getReviewsRelevant(product, count, page);
    }
    await Promise.all(reviews.rows).then((bigBox) => {
      output.results = bigBox;
      redisClient.set(product, JSON.stringify(output));
    });
  } catch (e) {
    console.log(e);
  }

  return output;
}

async function returnReviews(req) {
  const product = req.query.product_id;
  const count = Number(req.query.count) || 5;
  const page = Number(req.query.page) || 1;
  const sort = (!['newest', 'helpful', 'relevant'].includes(req.query.sort)) ? 'relevant' : req.query.sort;
  const result = await helper(product, count, page, sort);

  return result;
};


async function getReviews(req, res) {
  const output = await returnReviews(req);
  res.status(200).send(output);
};

async function getReviewsMeta(req, res) {
  const output = {
    product_id: req.query.product_id,
  };
  models.getReviewsMeta(req.query.product_id)
    .then((data) => {
      Object.assign(output, data.rows[0]);
      res.status(200).send(output);
    })
    .catch(e => console.log(e));
};

async function postReviews (req, res) {
  const product = req.body.product_id;
  models.postReviews(req.body)
  .then(async () => {
    try {
      const result = await helper(String(product), 5, 1, 'relevant');
      await redisClient.set(String(product), JSON.stringify(result));
    } catch (e) {
      console.log(e);
    }
  })
  .then(() => res.status(201).send('Successfully post the new review'))
  .catch(e => console.log(e));
};


function putReviewsHelpfulness (req, res) {
  models.putReviewsHelpfulness(req.params)
    .then(() => {
      res.status(204).send('Successfully increase the helpfulness');
    })
    .catch((err) => {
      throw new Error('Failed to change helpfulness', err);
    });
};

function putReviewsReport (req, res) {
  models.putReviewsReport(req.params)
    .then(() => {
      res.status(204).send('Successfully change report status');
    })
    .catch((err) => {
      throw new Error('Failed to change report status', err);
    });
};

function getLoaderToken (req, res) {
  res.status(200).send(loader);
};


module.exports = { returnReviews, cacheDataReviews, getReviews, getReviewsMeta, postReviews, putReviewsHelpfulness, putReviewsReport, getLoaderToken };