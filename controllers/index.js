const models = require('../models');
require('dotenv').config();
const loader = process.env.LOADER;
const Redis = require('redis');
let redisClient;

(async () => {
  redisClient = Redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USERNAME,
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

async function saveReviewToCache(product, count, page, sort) {
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


async function returnReviews(req) {
  const product = req.query.product_id;
  const count = Number(req.query.count) || 5;
  const page = Number(req.query.page) || 1;
  const sort = (!['newest', 'helpful', 'relevant'].includes(req.query.sort)) ? 'relevant' : req.query.sort;
  const result = await saveReviewToCache(product, count, page, sort);

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
  const [rating, summary, body, recommend, name, photos] = [req.body.rating, req.body.summary, req.body.body, req.body.recommend, req.body.name, req.body.photos];
  const cacheResult = await redisClient.get(String(product));
  let parseCacheResult = JSON.parse(cacheResult);

  let newReview = {};
  Object.assign(newReview, {rating, summary, body, recommend, reviewer_name: name, photos, 'date': new Date().toISOString(), 'helpfulness': 0, 'response': 'null'});


  // generate new review object: newReview
  await models.getMaxReviewId(product)
  .then(async (max_review_id) => {

    const maxReviewId = max_review_id.rows[0].max;
    newReview['review_id'] = maxReviewId + 1;

    await models.getMaxPhotoId(maxReviewId)
    .then((max_photo_id) => {

      let maxPhotoId = max_photo_id.rows[0].max;
      newReview['photos'].map((photo, index) => {
        newReview['photos'][index] = {'id': maxPhotoId++, 'url': photo}
      })

    })
    .catch(e => console.log(e));

  })
  .catch(e => console.log(e));


  // Conditionally write new review into the cache:
  if (cacheResult === null) {
    // case 1: if there is no cache existed for this product
    parseCacheResult = {product, page: 1, count: 5, sort: "default", results: [ newReview ]};

  } else {
    // case 2: if there was old cache existed for this product
    if (parseCacheResult['sort'] === 'newest') {
      // case 2.1: if all reviews were sorted by 'newest', then insert the new review at the index-0 place
      parseCacheResult['results'].unshift(newReview);

    } else if (parseCacheResult['sort'] === 'helpful') {
      // case 2.2: if all reviews were sorted by 'helpful', then insert the new review in front of the 1st old review which has 0 helpfulness
      let count = 0;
      for (let i = 0; i < parseCacheResult['results'].length; i++) {
        if (parseCacheResult['results'][i] === 0) {
          count++;
          parseCacheResult['results'].splice(i, 0, newReview);
          break;
        }
      }
      count === 0 ? parseCacheResult['results'][parseCacheResult['results'].length] = newReview : null;

    } else {
      // case 2.3: if all reviews were sorted by 'default', which means both helpfulness and newest has 50% of weights, then use the following algorithm to insert the new review into its exact place
      let weight_arr = [];
      parseCacheResult['results'].forEach((review, index) => weight_arr.push([review.date, index, review.helpfulness]));
      weight_arr.sort((a, b) => new Date(a[0]) - new Date(b[0]));

      weight_arr.map((arr, rank_number_newest) => {
        arr.shift();
        arr[2] = rank_number_newest + arr[1]; // this is the total weight for each review
        return arr;
      });

      let count = 0;
        // loop through the weight_arr (ordered by weight in the descending order)
      for (let rank_arr of weight_arr.sort((a, b) => b[2] - a[2])) {
        // if the total number of all old reviews is greater than the current review's weight
        if (weight_arr.length > rank_arr[2]) {
          count++;
          // then we insert the new review in front of the current review
          parseCacheResult['results'].splice(rank_arr[0], 0, newReview);
          break;
        }
      }

      // if count = 0, we will just insert the new review at the end
      count === 0 ? parseCacheResult['results'][weight_arr.length] = newReview : null;

    }

  }

  // write into the cache:
  redisClient.set(String(product), JSON.stringify(parseCacheResult));

  try {
    // save in the database:
    await models.postReviews(req.body)
    res.status(201).send('Successfully update new review in the cache and then db');
  } catch (e) {console.log(e)};

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
        const result = await saveReviewToCache(String(product_id), 5, 1, 'relevant');
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