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
      reviews = await models.getReviewsHelpfulWithoutPhotos(product, count, page);
    } else if (sort === 'newest') {
      reviews = await models.getReviewsNewestWithoutPhotos(product, count, page);
    } else {
      reviews = await models.getReviewsRelevantWithoutPhotos(product, count, page);
    }

    const results = reviews.rows;

    try {
      await Promise.all(results.map(async(review, index) => {
        const review_id = review.review_id;
        const photos = await models.json_agg_photos(review_id);
        results[index]['photos'] = photos.rows[0].photos;
      }))
    } catch(e) {
      console.log(e);
    }

    output.results = results;
    redisClient.set(String(product), JSON.stringify(output));

  } catch (e) {
    console.log(e);
  }

  return output;
}

async function getReviews(req, res) {
  const product = req.query.product_id;
  const count = Number(req.query.count) || 5;
  const page = Number(req.query.page) || 1;
  const sort = (!['newest', 'helpful', 'relevant'].includes(req.query.sort)) ? 'relevant' : req.query.sort;
  try {
    const output = await helper(product, count, page, sort);
    res.status(200).send(output);
  } catch (e) {
    console.log(e);
  }
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
  const [rating, summary, body, recommend, name, photos] = [req.body.rating, req.body.summary, req.body.body, req.body.recommend, req.body.name, req.body.photos];
  const cacheResult = await redisClient.get(String(product));
  const parseCacheResult = JSON.parse(cacheResult);

  if (cacheResult === null || parseCacheResult['sort'] !== 'newest') {
    models.postReviews(req.body)
    .then(async () => {
      try {
        const result = await helper(String(product), 5, 1, 'relevant');
        await redisClient.set(String(product), JSON.stringify(result));
      } catch (e) {
        console.log(e);
      }
    })
    .then(() => res.status(201).send('Successfully post new review in the db and then cache'))
    .catch(e => console.log('error', e));
  } else {
    let newReview = {};
    Object.assign(newReview, {rating, summary, body, recommend, reviewer_name: name, photos, 'date': new Date().toISOString(), 'helpfulness': 0, 'response': 'null'});
    await models.getMaxReviewId(product)
    .then(async (r_data) => {
      const maxReviewId = r_data.rows[0].max;
      newReview['review_id'] = maxReviewId + 1;
      await models.getMaxPhotoId(maxReviewId)
      .then((p_data) => {
        let maxPhotoId = p_data.rows[0].max;
        newReview['photos'].map((photo, index) => {
          newReview['photos'][index] = {'id': maxPhotoId++, 'url': photo}
        })
      })
      .catch(e => console.log(e));
    })
    .catch(e => console.log(e));
    parseCacheResult['results'].unshift(newReview);
    redisClient.set(String(product), JSON.stringify(parseCacheResult));
    try {
      await models.postReviews(req.body)
    } catch (e) {console.log(e)};
    res.status(201).send('Successfully update new review in the cache and then db');
  }

};

async function putReviewsHelpfulness (req, res) {
  const review_id = req.params.review_id;
  const getProductId = await models.getProductId(review_id);
  const product_id = getProductId.rows[0].product_id;
  const cacheResult = await redisClient.get(String(product_id));
  const parseCacheResult = JSON.parse(cacheResult);

  if (parseCacheResult) {
    const results = parseCacheResult.results;
    let cacheIncludesReviewId = false;
    results.map(review_obj => {
      if (review_obj['review_id'] == review_id) {
        review_obj['helpfulness']++;
        cacheIncludesReviewId = true;
      }
    })
    cacheIncludesReviewId ? redisClient.set(String(product_id), JSON.stringify(parseCacheResult)) : null;
  }

  models.putReviewsHelpfulness(req.params)
  .then(async (data) => {
    const product_id = data.rows[0].product_id;
    if (!parseCacheResult) {
      try {
        const result = await helper(String(product_id), 5, 1, 'relevant');
        await redisClient.set(String(product_id), JSON.stringify(result));
      } catch (e) {
        console.log(e);
      }
    }
    res.status(204).send('Successfully increase the helpfulness');
  })
  .catch((err) => {
    console.log(err);
  });
};


async function putReviewsReport (req, res) {
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

module.exports = { cacheDataReviews, getReviews, getReviewsMeta, postReviews, putReviewsHelpfulness, putReviewsReport, getLoaderToken };