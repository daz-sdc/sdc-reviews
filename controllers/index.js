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
  console.log(page, count, productId, sort);
  const output = {
    product: productId,
    page,
    count,
  };
  // res.send('getReviews!!');
  // console.log('this is a promise', models.getReviews(page, count, sort, productId));
  // const reviews = await models.getReviews(productId, count, page);
  let reviews;

  if (sort === 'helpful') {
    reviews = await models.getReviewsHelpful(productId, count, page);
  } else if (sort === 'newest') {
    reviews = await models.getReviewsNewest(productId, count, page);
  } else {
    reviews = await models.getReviewsRelevant(productId, count, page);
  }
  console.log('reviews!!!', reviews.rows);
  const arr = reviews.rows.map(async (review) => {
    const photos = await models.getPhotos(review.review_id);
    review.photos = photos.rows;
    return review;
  });

  // Promise.All(arr) // this returns a promise, unwrap each box in the big box
  Promise.all(arr).then((bigBox) => {
    // console.log('FINAL ARRAY', bigBox);
    // res.send(bigBox);
    output.results = bigBox;
    console.log('FINAL OUTPUT', output);
    res.send(output);
  });

  // console.log('FINAL ARRAY', arr);
  // res.send(arr);




// ******************** My Previous code that doesn't work:************************* //
  // const arr = [];
  // if (sort === 'relevant') {
  //   models.getReviewsRelevant(productId, count, page)
  //   .then((result) => {
  //     console.log('result.rows', result.rows); // <--- this works
  //     for (let i = 0; i < result.rows.length; i++) {
  //       const obj = result.rows[i];
  //       models.getPhotos(obj.review_id)
  //         .then((result) => {
  //           obj.photos = result.rows;
  //           console.log('object', obj); // <--- this works
  //           return obj;
  //         })
  //         .then((obj) => {
  //           arr.push(obj);
  //         })
  //         .then(() => {
  //           if (arr.length === result.rows.length) {
  //             console.log('arr', arr); // <--- this works
  //           }
  //         })
  //         .catch((err) => console.log('???errrrrr???', err));
  //     }
  //   })
  //   .then(() => {
  //     console.log('******REVIEWS RESULT******', arr); // <--- THIS DOESN'T WORK, and it returns an empty array
  //     res.send('haha');
  //   })
  //   .catch((err) => {
  //     console.log('******err/controllers/getReviews******', err);
  //     res.send(err);
  //   });
  // }
};







exports.getReviewsMeta = async (req, res) => {
  const productId = req.query.product_id;
  const output = {
    product_id: productId,
  };
  // models.getRatings(productId)
  //   .then((result) => {
  //     console.log('``````getRatings```````', result.rows);
  //   })
  //   .catch((err) => console.log(err));
  const arrOfRatings = await models.getRatings(productId);
  const objOfRatings = {};
  arrOfRatings.rows.forEach((rating) => {
    const valsOfRating = Object.values(rating);
    objOfRatings[valsOfRating[0].toString()] = valsOfRating[1];
  });
  // console.log('objOfRatings', objOfRatings);
  // models.getRecommended(productId)
  //   .then((result) => {
  //     console.log('````````getRecommended````````', result.rows);
  //   })
  //   .catch((err) => console.log(err));
  const arrOfRecommended = await models.getRecommended(productId);
  const objOfRecommended = {};
  arrOfRecommended.rows.forEach((recommend) => {
    const valsOfRecommend = Object.values(recommend);
    objOfRecommended[valsOfRecommend[0].toString()] = valsOfRecommend[1];
  });
  // console.log('objOfRecommended', objOfRecommended);
  // models.getCharacteristics(productId)
  //   .then((result) => {
  //     console.log('````````getCharacteristics```````', result.rows);
  //   })
  //   .catch((err) => console.log(err));
  const arrOfCharacteristics = await models.getCharacteristics(productId);
  const objOfCharacteristics = {};
  arrOfCharacteristics.rows.forEach((char) => {
    const valsOfChar = Object.values(char);
    objOfCharacteristics[valsOfChar[2]] = {
      id: valsOfChar[0],
      value: valsOfChar[1],
    };
  });
  // console.log('objOfCharacteristics', objOfCharacteristics);
  output.ratings = objOfRatings;
  output.recommended = objOfRecommended;
  output.characteristics = objOfCharacteristics;
  console.log('output', output);
  res.send(output);
};

exports.postReviews = (req, res) => {
  console.log('requestBody', req.body);
  models.postReviews(req.body)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      console.log('ERR POSTREVIEWS', err);
      res.status(501).send(err);
    });
};

exports.putReviewsHelpfulness = (req, res) => {

};

exports.putReviewsReport = (req, res) => {

};

// localhost:8000/reviews?product_id=71701
// http://localhost:8000/reviews?product_id=71701&count=100&page=2&sort=helpful