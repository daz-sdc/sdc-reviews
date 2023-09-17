// const models = require('../models');
// require('dotenv').config();
// const loader = process.env.LOADER;
// const Redis = require('redis');
// let redisClient;

// (async () => {
//   redisClient = Redis.createClient({
//     host: process.env.REDIS_HOST,
//     port: process.env.REDIS_PORT,
//     password: process.env.REDIS_PASSWORD
//   });
//   redisClient.on('error', err => console.log('Redis Client Error', err));
//   await redisClient.connect();
// })();

// exports.cacheDataReviews = async function cacheDataReviews(req, res, next) {
//   const product = req.query.product_id;
//   try {
//     const cacheResults = await redisClient.get(product);
//     if (cacheResults) {
//       res.status(200).send(JSON.parse(cacheResults));
//     } else {
//       next();
//     }
//   } catch (error) {
//     throw new Error('Cache Error', error);
//   }
// }

// // exports.getReviews = async function getReviews(req, res) {
// //   const page = Number(req.query.page) || 1;
// //   const count = Number(req.query.count) || 5;
// //   const sort = (!['newest', 'helpful', 'relevant'].includes(req.query.sort)) ? 'relevant' : req.query.sort;
// //   const product = req.query.product_id;
// //   const output = { product, page, count };

// //   let reviews;
// //   try {
// //       if (sort === 'helpful') {
// //         reviews = await models.getReviewsHelpful(product, count, page);
// //       } else if (sort === 'newest') {
// //         reviews = await models.getReviewsNewest(product, count, page);
// //       } else {
// //         reviews = await models.getReviewsRelevant(product, count, page);
// //       }

// //       Promise.all(reviews.rows).then(async(bigBox) => {
// //         output.results = bigBox;
// //         redisClient.set(product, JSON.stringify(output));
// //         res.status(200).send(output);
// //       });

// //   } catch (e) {
// //     throw new Error('Failed to get reviews', e);
// //   }
// // };

// exports.getReviews = async function getReviews(req, res) {
//     const output = await purelygetreviews(req);
//     res.status(200).send(output);
// };


// async function purelygetreviews(req) {
//   const page = Number(req.query.page) || 1;
//   const count = Number(req.query.count) || 5;
//   const sort = (!['newest', 'helpful', 'relevant'].includes(req.query.sort)) ? 'relevant' : req.query.sort;
//   const product = req.query.product_id;
//   const output = { product, page, count };

//   let reviews;

//   if (sort === 'helpful') {
//     reviews = await models.getReviewsHelpful(product, count, page);
//   } else if (sort === 'newest') {
//     reviews = await models.getReviewsNewest(product, count, page);
//   } else {
//     reviews = await models.getReviewsRelevant(product, count, page);
//   }

//   await Promise.all(reviews.rows).then((bigBox) => {
//     output.results = bigBox;
//     redisClient.set(product, JSON.stringify(output));
//   });

//   return output;
// };




// exports.getReviewsMeta = async function getReviewsMeta(req, res) {
//   const output = {
//     product_id: req.query.product_id,
//   };
//   models.getReviewsMeta(req.query.product_id)
//     .then((data) => {
//       Object.assign(output, data.rows[0]);
//       res.status(200).send(output);
//     })
//     .catch((err) => {
//       throw new Error('Failed to get reviews metadata', err);
//     });
// };

// exports.postReviews = (req, res, next) => {
//   const product = req.body.product_id;
//   models.postReviews(req.body)
//   .then(() => {
//     res.status(201).send('Successfully post the new review');
//     next();
//   })
//   .catch((err) => {
//     throw new Error('Failed to post the review', err);
//   });
// };



// exports.putReviewsHelpfulness = (req, res) => {
//   models.putReviewsHelpfulness(req.body)
//     .then((data) => {
//       res.status(204).send('Successfully increase the helpfulness');
//     })
//     .catch((err) => {
//       throw new Error('Failed to change helpfulness', err);
//     });
// };

// exports.putReviewsReport = (req, res) => {
//   models.putReviewsReport(req.body)
//     .then((data) => {
//       res.status(204).send('Successfully change report status');
//     })
//     .catch((err) => {
//       throw new Error('Failed to change report status', err);
//     });
// };

// exports.getLoaderToken = (req, res) => {
//   res.status(200).send(loader);
// };











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
  try {
    const cacheResult = await redisClient.get(String(product));
    if (cacheResult) {
      res.status(200).send(JSON.parse(cacheResult));
    } else {
      next();
    }
  } catch (error) {
    throw new Error('Cache Error', error);
  }
}

async function getReviews(req, res) {
  const output = await purelygetreviews(req);
  res.status(200).send(output);
};

async function purelygetreviews(req) {
  const page = Number(req.query.page) || 1;
  const count = Number(req.query.count) || 5;
  const sort = (!['newest', 'helpful', 'relevant'].includes(req.query.sort)) ? 'relevant' : req.query.sort;
  const product = req.query.product_id;
  const output = { product, page, count };
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
  } catch (err) {
    console.log(err);
    throw Error('Failed to get reviews');
  }

  return output;
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
    .catch((err) => {
      throw new Error('Failed to get reviews metadata', err);
    });
};

async function postReviews (req, res) {
  const product = req.body.product_id;
  models.postReviews(req.body)
  .then(async () => {
    try {
      const cacheResult = await redisClient.get(String(product));
      if (cacheResult !== null) {
        redisClient.del(String(product));
      }
    } catch (err) {
      throw Error(err);
    }
  })
  .then(() => res.status(201).send('Successfully post the new review'))
  .catch((err) => {
    throw Error(err);
  })
};


// putReviewsHelpfulness (req, res) {
//   models.putReviewsHelpfulness(req.body)
//     .then((data) => {
//       res.status(204).send('Successfully increase the helpfulness');
//     })
//     .catch((err) => {
//       throw new Error('Failed to change helpfulness', err);
//     });
// };

// putReviewsReport (req, res) {
//   models.putReviewsReport(req.body)
//     .then((data) => {
//       res.status(204).send('Successfully change report status');
//     })
//     .catch((err) => {
//       throw new Error('Failed to change report status', err);
//     });
// };

function getLoaderToken (req, res) {
  res.status(200).send(loader);
};


module.exports = { purelygetreviews, cacheDataReviews, getReviews, getReviewsMeta, postReviews, getLoaderToken };