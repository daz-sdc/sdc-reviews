const db = require('../db');

// reviews:
exports.getReviewsHelpful = (id, count, page) => {
  const text = `SELECT r.review_id, r.rating, r.summary, r.response, r.body, r.date, r.recommend, r.reviewer_name, r.helpfulness,
                CASE
                  WHEN jsonb_typeof(rp.photos) IS NULL THEN '[]'::jsonb
                  ELSE rp.photos
                END photos
                FROM reviews r
                LEFT JOIN
                  (SELECT review_id, jsonb_agg(jsonb_build_object('id', id, 'url', url)) AS photos
                  FROM reviews_photos
                  GROUP by review_id
                  ) rp
                ON rp.review_id = r.review_id
                WHERE product_id = $1
                ORDER BY helpfulness DESC
                LIMIT $2
                OFFSET ($3 - 1) * $2`;
  const params = [id, count, page];
  return db.query(text, params);
};

exports.getReviewsNewest = (id, count, page) => {
  const text = `SELECT r.review_id, r.rating, r.summary, r.response, r.body, r.date, r.recommend, r.reviewer_name, r.helpfulness,
                CASE
                  WHEN jsonb_typeof(rp.photos) IS NULL THEN '[]'::jsonb
                  ELSE rp.photos
                END photos
                FROM reviews r
                LEFT JOIN
                  (SELECT review_id, jsonb_agg(jsonb_build_object('id', id, 'url', url)) AS photos
                  FROM reviews_photos
                  GROUP by review_id
                  ) rp
                ON rp.review_id = r.review_id
                WHERE product_id = $1
                ORDER BY date DESC
                LIMIT $2
                OFFSET ($3 - 1) * $2`;
  const params = [id, count, page];
  return db.query(text, params);
};

exports.getReviewsRelevant = (id, count, page) => {
  const text = `SELECT r.review_id, r.rating, r.summary, r.response, r.body, r.date, r.recommend, r.reviewer_name, r.helpfulness,
                CASE
                  WHEN jsonb_typeof(rp.photos) IS NULL THEN '[]'::jsonb
                  ELSE rp.photos
                END photos
                FROM reviews r
                LEFT JOIN
                  (SELECT review_id, jsonb_agg(jsonb_build_object('id', id, 'url', url)) AS photos
                  FROM reviews_photos
                  GROUP by review_id
                  ) rp
                ON rp.review_id = r.review_id
                WHERE product_id = $1
                ORDER BY RANK() OVER (ORDER BY r.helpfulness DESC) + RANK() OVER (ORDER BY r.date DESC) ASC
                LIMIT $2
                OFFSET ($3 - 1) * $2`;
  const params = [id, count, page];
  return db.query(text, params);
};

// reviews&ratings metadata:

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