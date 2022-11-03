/* eslint-disable max-len */
/* eslint-disable indent */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable consistent-return */
/* eslint-disable no-shadow */
/* eslint-disable no-console */
// Handles request flow
// Never handles data logic
const models = require('../models/index');

exports.getReviews = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const count = Number(req.query.count) || 5;
  const sort = (!['newest', 'helpful', 'relevant'].includes(req.query.sort)) ? 'relevant' : req.query.sort;
  const productId = req.query.product_id;
  // console.log(page, count, productId, sort);
  const output = {
    product: productId,
    page,
    count,
  };

  let reviews;

  if (sort === 'helpful') {
    reviews = await models.getReviewsHelpful(productId, count, page);
  } else if (sort === 'newest') {
    reviews = await models.getReviewsNewest(productId, count, page);
  } else {
    reviews = await models.getReviewsRelevant(productId, count, page);
  }
  // console.log('reviews!!!', reviews.rows);
  // const arr = reviews.rows.map(async (review) => {
  //   const photos = await models.getPhotos(review.review_id);
  //   review.photos = photos.rows;
  //   return review;
  // });



  // Promise.All(arr) // this returns a promise, unwrap each box in the big box
  Promise.all(reviews.rows).then((bigBox) => {
    // console.log('FINAL ARRAY', bigBox);
    // res.send(bigBox);
    output.results = bigBox;
    // console.log('FINAL OUTPUT', output);
    res.send(output);
  });
};



// // // NEW VERSION:
exports.getReviewsMeta = async (req, res) => {
  const productId = req.query.product_id;
  const arr = await models.getReviewsMeta(productId);
  const output = {
    product_id: productId,
  };
  Object.assign(output, arr.rows[0]);
  res.send(output);
};


// // // PREVIOUS VERSION:
// // promise.all
// // newrelic npm
// exports.getReviewsMeta = async (req, res) => {
//   const productId = req.query.product_id;
//   const output = {
//     product_id: productId,
//   };

//   const arrOfRatings = await models.getRatings(productId);
//   const objOfRatings = {};
//   console.log('arrOfRatings.rows', arrOfRatings.rows);
//   arrOfRatings.rows.forEach((rating) => {
//     const valsOfRating = Object.values(rating);
//     objOfRatings[valsOfRating[0].toString()] = valsOfRating[1];
//   });

//   const arrOfRecommended = await models.getRecommended(productId);
//   const objOfRecommended = {};
//   arrOfRecommended.rows.forEach((recommend) => {
//     const valsOfRecommend = Object.values(recommend);
//     objOfRecommended[valsOfRecommend[0].toString()] = valsOfRecommend[1];
//   });

//   const arrOfCharacteristics = await models.getCharacteristics(productId);
//   const objOfCharacteristics = {};
//   arrOfCharacteristics.forEach(async (obj) => {
//     // console.log('~~~EACH~~~', obj);
//     objOfCharacteristics[obj.name] = {
//       id: obj.id,
//       value: obj.avg,
//     };
//   });
//   // arrOfCharacteristics
//   // .then((res) => {
//   //   console.log('res of arrofCharacteristics', res);
//   //   res.forEach((obj) => {
//   //     objOfCharacteristics[obj.name] = {
//   //       id: obj.id,
//   //       value: obj.avg,
//   //     };
//   //   });
//   //   console.log('***objOfCharacteristics***', objOfCharacteristics);
//   // })
//   // .catch((err) => {
//   //   console.log('err of arrofCharacteristics', err);
//   // });


//   // const objOfCharacteristics = {};
//   // arrOfCharacteristics.rows.forEach((char) => {
//   //   const valsOfChar = Object.values(char);
//   //   objOfCharacteristics[valsOfChar[2]] = {
//   //     id: valsOfChar[0],
//   //     value: valsOfChar[1],
//   //   };
//   // });

//   output.ratings = objOfRatings;
//   output.recommended = objOfRecommended;
//   output.characteristics = objOfCharacteristics;
//   // console.log('output', output);
//   res.send(output);
// };

exports.postReviews = (req, res) => {
  // console.log('POST******postReviews******requestBody', req.body);
  models.postReviews(req.body)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      // console.log('ERR POSTREVIEWS', err);
      res.status(501).send(err);
    });
};

exports.putReviewsHelpfulness = (req, res) => {
  // console.log('PUT******putReviewsHelpfulness******requestBody', req.body);
  models.putReviewsHelpfulness(req.body)
    .then((data) => {
      // console.log('putReviewsHelpfulness success');
      res.status(204).send(data);
    })
    .catch((err) => {
      // console.log('ERR PUTREVIEWSHELPFULNESS', err);
      res.status(501).send(err);
    });
};

exports.putReviewsReport = (req, res) => {
  // console.log('PUT******putReviewsReport******requestBody', req.body);
  models.putReviewsReport(req.body)
  .then((data) => {
    // console.log('putReviewsReport success');
    res.status(204).send(data);
  })
  .catch((err) => {
    // console.log('ERR PUTREVIEWSREPORTED', err);
    res.status(501).send(err);
  });
};

// localhost:8000/reviews?product_id=71701
// http://localhost:8000/reviews?product_id=71701&count=100&page=2&sort=helpful

