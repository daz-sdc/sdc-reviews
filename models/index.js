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

// post reviews:
exports.postReviews = async (obj) => {
  const text1 = `INSERT INTO reviews (review_id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
                 SELECT nextval('reviews_id_seq'), $1, $2, current_timestamp, $3, $4, $5, FALSE, $6, $7, NULL, 0
                 RETURNING review_id`;
  const params = [obj.product_id, obj.rating, obj.summary, obj.body, obj.recommend, obj.name, obj.email];

  try {
    var rid = await db.query(text1, params);
  } catch (err) {
    console.log('Error: insert into reviews table');
  }

  let rewid = rid.rows[0].review_id;
  const promise_arr_review_photos = obj.photos.map((photoUrl) => {
    return db.query(`INSERT INTO reviews_photos (id, review_id, url) SELECT nextval('reviews_photos_id_seq'), ${rewid}, '${photoUrl}'`);
  });

  try {
    await Promise.all(promise_arr_review_photos);
  } catch (err) {
    console.log('reviews_photos_insert_error', err);
  }

  const promise_arr_char_reviews = Object.keys(obj.characteristics).map((charId) => {
    const charVal = obj.characteristics[charId];
    return db.query(`INSERT INTO characteristic_reviews (id, characteristic_id, review_id, value) SELECT nextval('characteristic_reviews_id_seq'), ${charId}, ${rewid}, ${charVal}`);
  });

  try {
    await Promise.all(promise_arr_char_reviews);
  } catch (err) {
    console.log('char_reviews_insert_error', err);
  }

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
