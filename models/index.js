/* eslint-disable no-console */
/* eslint-disable no-unreachable */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable padded-blocks */
/* eslint-disable no-trailing-spaces */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
// Handles data logic
// Interacts with database
const db = require('../db/index');

exports.getReviewsHelpful = (id, count, page) => {
  const text = `SELECT review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness
                FROM reviews
                WHERE $1::integer IS NULL or product = $1::integer
                ORDER BY helpfulness DESC
                LIMIT $2
                OFFSET ($3 - 1) * $2`;
  const params = [id, count, page];
  return db.query(text, params);
};

exports.getReviewsNewest = (id, count, page) => {
  const text = `SELECT review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness
                FROM reviews
                WHERE $1::integer IS NULL or product = $1::integer
                ORDER BY date DESC
                LIMIT $2
                OFFSET ($3 - 1) * $2`;
  const params = [id, count, page];
  return db.query(text, params);
};

exports.getReviewsRelevant = (id, count, page) => {
  const text = `SELECT review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness
                FROM reviews
                WHERE $1::integer IS NULL or product = $1::integer
                ORDER BY
                CASE WHEN (date_part('year', (SELECT current_timestamp)) - EXTRACT(YEAR FROM date) <= 2)
                     THEN helpfulness END DESC,
                CASE WHEN (date_part('year', (SELECT current_timestamp)) - EXTRACT(YEAR FROM date) > 2)
                     THEN date END DESC
                LIMIT $2
                OFFSET ($3 - 1) * $2`;
  const params = [id, count, page];
  return db.query(text, params);
};

// test1:
// const text = `SELECT r.product, r.helpfulness, rp.photo_id, rp.url, rp.review_id FROM reviews as r JOIN reviews_photos as rp ON r.id = rp.review_id WHERE $1 IS NULL or r.product = $1`;

// test2:
// const text = `SELECT rp.review_id, r.rating, r.summary, r.recommend, r.response, r.body, r.date, r.reviewer_name, r.helpfulness, rp.photo_id, rp.url FROM reviews r JOIN reviews_photos as rp ON r.id = rp.review_id WHERE $1::integer IS NULL or r.product = $1::integer`;

// original:
// const text = `SELECT r.product, r.rating, r.summary, r.recommend, r.response, r.body, r.date, r.reviewer_name, r.helpfulness, rp.photo_id, rp.url, rp.review_id FROM reviews r JOIN reviews_photos as rp ON r.id = rp.review_id WHERE $1::integer IS NULL or r.product = $1::integer`;

exports.getPhotos = (reviewId) => {
  const text = `SELECT id, url
                FROM reviews_photos
                WHERE $1::integer IS NULL or review_id = $1::integer`;
  const params = [reviewId];
  return db.query(text, params);
};

// Meta:
exports.getRatings = (id) => {
  const text = `SELECT rating, count(rating)
                FROM reviews
                WHERE $1::integer IS NULL or product = $1::integer
                GROUP BY rating`;
  const params = [id];
  return db.query(text, params);
};

exports.getRecommended = (id) => {
  const text = `SELECT recommend, count(recommend)
                FROM reviews
                WHERE $1::integer IS NULL or product = $1::integer
                GROUP BY recommend`;
  const params = [id];
  return db.query(text, params);
};

exports.getCharacteristics = (id) => {
  const text = `SELECT c.id, AVG(cr.value), c.name
                FROM characteristic_reviews as cr
                JOIN characteristics as c
                ON cr.characteristic_id = c.id
                WHERE $1::integer IS NULL or product_id = $1::integer
                GROUP BY c.id`;
  const params = [id];
  return db.query(text, params);
};

exports.postReviews = async (obj) => {
  // // const datetime = new Date(Date.now()).toISOString();
  // // const now = datetime.replace('Z', ' ').replace('T', ' ');

  // // pgAdmin's test: INSERT INTO reviews (review_id, product, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
  // // SELECT max(review_id) + 1, 20, 5, current_timestamp, 'testing summary on Oct 20', 'BODY', 't', 'f', 'ds', 'ds@gmail.com', 'null', 0 FROM reviews;
  // // Previous: const text1 = `INSERT INTO reviews (review_id, product, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
  // //               SELECT max(review_id) + 1, ${obj.product_id}, ${obj.rating}, current_timestamp, "${obj.summary}", "${obj.body}", "${obj.recommend}", "f", "${obj.name}", "${obj.email}", "NULL", 0 FROM reviews`;

  const text1 = `INSERT INTO reviews (review_id, product, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
                 SELECT max(review_id) + 1, $1, $2, current_timestamp, $3, $4, $5, FALSE, $6, $7, NULL, 0 FROM reviews
                 RETURNING review_id`;
  const params1 = [obj.product_id, obj.rating, obj.summary, obj.body, obj.recommend, obj.name, obj.email];
  db.query(text1, params1);
  const rid = await db.query(text1, params1); // send to the db


  obj.photos.forEach((photoUrl) => {
    const rewid = rid.rows[0].review_id;
    console.log('RID: ', rewid);
    const text2 = `INSERT INTO reviews_photos (id, review_id, url) SELECT max(id) + 1, ${rewid}, '${photoUrl}' FROM reviews_photos`;
    db.query(text2);
  });

  Object.keys(obj.characteristics).forEach((charId) => {
    const charVal = obj.characteristics[charId];
    console.log('charVal', charVal);
    const rewid = rid.rows[0].review_id;
    console.log('RIDDD: ', rewid);
    const text3 = `INSERT INTO characteristic_reviews (id, characteristic_id, review_id, value) SELECT max(id) + 1, ${charId}, ${rewid}, ${charVal} FROM characteristic_reviews`;
    db.query(text3);
  });
  // INSERT INTO characteristic_reviews (id, characteristic_id, review_id, value) SELECT max(id) + 1, 123321123321, 5774990, 1 FROM characteristic_reviews;


  // testing code:
  // const text = `WITH ins1 AS (
  //               INSERT INTO reviews (review_id, product, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
  //               SELECT max(review_id) + 1, $1, $2, current_timestamp, $3, $4, $5, FALSE, $6, $7, NULL, 0 FROM reviews
  //               RETURNING review_id;
  //               )
  //             , ins2 AS (
  //               BEGIN
  //                 FOREACH photoUrl IN ARRAY $8
  //                 LOOP
  //                   INSERT INTO reviews_photos (id, review_id, url)
  //                   SELECT max(id) + 1, review_id, photoUrl FROM ins1
  //                   RETURNING review_id
  //                 END LOOP;
  //               END)
  //             BEGIN
  //               FOREACH charId IN ARRAY $10
  //               LOOP
  //                 INSERT INTO characteristic_reviews (id, characteristic_id, review_id, value)
  //                 SELECT max(id) + 1, charId, review_id, $9[charId] FROM ins1
  //               END LOOP;
  //             END
  //             )`;

  // const text = `WITH ins1 AS (
  //   INSERT INTO reviews (review_id, product, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
  //   SELECT max(review_id) + 1, $1, $2, current_timestamp, $3, $4, $5, FALSE, $6, $7, NULL, 0 FROM reviews
  //   RETURNING review_id;
  //   )
  // , ins2 AS (
  //   DO $FN$
  //   BEGIN
  //     FOREACH photoUrl IN ARRAY $8
  //     LOOP
  //       EXECUTE $$ INSERT INTO reviews_photos (id, review_id, url)
  //       SELECT max(id) + 1, review_id, photoUrl FROM ins1
  //       RETURNING review_id $$
  //     END LOOP;
  //   END;
  //   $FN$)
  // (DO $FN$
  // BEGIN
  //   FOREACH charId IN ARRAY $10
  //   LOOP
  //     EXECUTE $$ INSERT INTO characteristic_reviews (id, characteristic_id, review_id, value)
  //     SELECT max(id) + 1, charId, review_id, $9[charId] FROM ins1 $$
  //   END LOOP;
  // END;
  // $FN$)`;
};


