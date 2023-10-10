const db = require('../db');

// get reviews sorted by helpfulness, newest and default resp:
exports.getReviewsHelpfulWithoutPhotos = (id, count, page) => {
  const text = `SELECT review_id, rating, summary, response, body, date, recommend, reviewer_name, helpfulness
                FROM reviews
                WHERE product_id = $1
                ORDER BY helpfulness DESC
                LIMIT $2
                OFFSET ($3 - 1) * $2`;
  const params = [id, count, page];
  return db.query(text, params);
};

exports.getReviewsNewestWithoutPhotos = (id, count, page) => {
  const text = `SELECT review_id, rating, summary, response, body, date, recommend, reviewer_name, helpfulness
                FROM reviews
                WHERE product_id = $1
                ORDER BY date DESC
                LIMIT $2
                OFFSET ($3 - 1) * $2`;
  const params = [id, count, page];
  return db.query(text, params);
};

exports.getReviewsRelevantWithoutPhotos = (id, count, page) => {
  const text = `SELECT review_id, rating, summary, response, body, date, recommend, reviewer_name, helpfulness
                FROM reviews
                WHERE product_id = $1
                ORDER BY helpfulness + RANK() OVER (ORDER BY date ASC) DESC
                LIMIT $2
                OFFSET ($3 - 1) * $2`;
  const params = [id, count, page];
  return db.query(text, params);
};

// SELECT date, helpfulness, (helpfulness + RANK() OVER (ORDER BY date ASC)) AS rank FROM reviews WHERE product_id = 50 ORDER BY rank DESC;

exports.json_agg_photos = (review_id) => {
  const text = `SELECT
                CASE
                  WHEN jsonb_typeof(rp.photos) IS NULL THEN '[]'::jsonb
                  ELSE rp.photos
                END photos
                FROM (
                  SELECT jsonb_agg(jsonb_build_object('id', id, 'url', url)) AS photos
                  FROM reviews_photos
                  WHERE review_id = ${review_id}
                ) rp`
  return db.query(text);
}

// get reviews&ratings metadata:
exports.getReviewsMeta = (id) => {
  const text = `SELECT ratings, recommended, characteristics
                FROM (
                  SELECT s1.product_id, s1.ratings, s2.recommended, s3.characteristics
                  FROM (
                    SELECT
                      product_id, jsonb_object_agg (value, CAST(count_char_value AS VARCHAR)) AS ratings
                    FROM (
                      SELECT
                        c.product_id, cr.value, COUNT(cr.value) AS count_char_value
                      FROM  characteristic_reviews cr
                      LEFT JOIN characteristics c
                      ON cr.characteristic_id = c.id
                      GROUP BY c.product_id, cr.value
                    ) s11
                    GROUP BY s11.product_id
                  ) s1
                  FULL OUTER JOIN (
                    SELECT
                      product_id, jsonb_object_agg (recommend, CAST(count_recommend AS VARCHAR)) AS recommended
                    FROM (
                      SELECT
                      product_id, recommend, COUNT(recommend) AS count_recommend
                      FROM reviews
                      GROUP BY product_id, recommend
                    ) s22
                    GROUP BY s22.product_id
                  ) s2
                  ON s1.product_id = s2.product_id
                  FULL OUTER JOIN (
                    SELECT product_id, jsonb_object_agg(name, overall_characteristics) AS characteristics
                    FROM (
                      SELECT product_id, name, jsonb_build_object('id', char_id, 'value', CAST(avg_value AS VARCHAR)) AS overall_characteristics
                      FROM (
                        SELECT c.product_id, c.id as char_id, c.name, CAST(SUM(cr.value) AS DECIMAL) / COUNT(c.id) as avg_value
                        FROM characteristic_reviews cr
                        LEFT JOIN characteristics c
                        ON cr.characteristic_id = c.id
                        GROUP BY char_id, c.product_id
                      ) t
                    ) tt
                    GROUP BY product_id
                  ) s3
                  ON s3.product_id = s1.product_id
                ) info_metadata
                WHERE product_id = $1`;
  const params = [id];
  return db.query(text, params);
};

// post reviews:
exports.postReviews = async (obj) => {
  const text1 = `INSERT INTO reviews (review_id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
                 SELECT nextval('reviews_review_id_seq'), $1, $2, current_timestamp, $3, $4, $5, FALSE, $6, $7, NULL, 0
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

exports.getMaxReviewId = (product_id) => {
  return db.query(`SELECT MAX(review_id) FROM reviews WHERE product_id = ${product_id}`);
}

exports.getMaxPhotoId = (review_id) => {
  return db.query(`SELECT MAX(id) FROM reviews_photos WHERE review_id = ${review_id}`);
}

// change helpfulness:
exports.putReviewsHelpfulness = async (obj) => {
  const reviewId = obj.review_id;
  const text = `UPDATE reviews SET helpfulness = helpfulness + 1 WHERE review_id = ${reviewId} RETURNING product_id`;
  const result = await db.query(text);
  return result;
};

exports.getProductId = (review_id) => {
  return db.query(`SELECT product_id FROM reviews WHERE review_id = ${review_id}`);
}

// change report status:
exports.putReviewsReport = async (obj) => {
  const reviewId = obj.review_id;
  const text = `UPDATE reviews SET reported = NOT reported WHERE review_id = ${reviewId}`;
  await db.query(text);
};

