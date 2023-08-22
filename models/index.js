const db = require('../db');

// reviews:
exports.getReviewsHelpful = (id, count, page) => {
  const text = `SELECT review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness, photos
                FROM mv_reviews_tb
                WHERE product_id = $1
                ORDER BY helpfulness DESC
                LIMIT $2
                OFFSET ($3 - 1) * $2`;
  const params = [id, count, page];
  return db.query(text, params);
};

exports.getReviewsNewest = (id, count, page) => {
  const text = `SELECT review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness, photos
                FROM mv_reviews_tb
                WHERE product_id = $1
                ORDER BY date DESC
                LIMIT $2
                OFFSET ($3 - 1) * $2`;
  const params = [id, count, page];
  return db.query(text, params);
};

exports.getReviewsRelevant = (id, count, page) => {
  const text = `SELECT review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness, photos
                FROM (
                    SELECT *, RANK() OVER (ORDER BY helpfulness DESC) rank_helpfulness, RANK() OVER (ORDER BY date DESC) rank_date
                    FROM mv_reviews_tb
                    WHERE product_id = $1 ) t
                ORDER BY t.rank_helpfulness + t.rank_date ASC
                LIMIT $2
                OFFSET ($3 - 1) * $2`;
  const params = [id, count, page];
  return db.query(text, params);
};

// reviews&ratings metadata:

exports.getReviewsMeta = (id) => {
  const text = 'SELECT ratings, recommended, characteristics FROM mv_meta_tb WHERE product_id = $1';
  const params = [id];
  return db.query(text, params);
};

exports.postReviews = async (obj) => {
  // const datetime = new Date(Date.now()).toISOString();
  // const now = datetime.replace('Z', ' ').replace('T', ' ');

  // pgAdmin's test: INSERT INTO reviews (review_id, product, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
  // SELECT max(review_id) + 1, 20, 5, current_timestamp, 'testing summary on Oct 20', 'BODY', 't', 'f', 'ds', 'ds@gmail.com', 'null', 0 FROM reviews;
  // Previous: const text1 = `INSERT INTO reviews (review_id, product, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
  //               SELECT max(review_id) + 1, ${obj.product_id}, ${obj.rating}, current_timestamp, "${obj.summary}", "${obj.body}", "${obj.recommend}", "f", "${obj.name}", "${obj.email}", "NULL", 0 FROM reviews`;

  const text1 = `INSERT INTO reviews (review_id, product, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
                 SELECT max(review_id) + 1, $1, $2, current_timestamp, $3, $4, $5, FALSE, $6, $7, NULL, 0 FROM reviews
                 RETURNING review_id`;
  const params1 = [obj.product_id, obj.rating, obj.summary, obj.body, obj.recommend, obj.name, obj.email];
  db.query(text1, params1);
  const rid = await db.query(text1, params1); // running db.query will send to the db


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
  // testing query works in pgAdmin:
  // INSERT INTO characteristic_reviews (id, characteristic_id, review_id, value) SELECT max(id) + 1, 123321123321, 5774990, 1 FROM characteristic_reviews;

  // testing code that can't work:
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

exports.putReviewsHelpfulness = (obj) => {
  const reviewId = obj.review_id;
  const text = `UPDATE reviews SET helpfulness = helpfulness + 1 WHERE review_id = ${reviewId}`;
  return db.query(text);
};

exports.putReviewsReport = (obj) => {
  const reviewId = obj.review_id;
  const text = `UPDATE reviews SET reported = NOT reported WHERE review_id = ${reviewId}`;
  return db.query(text);
};
