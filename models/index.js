const db = require('../db');
// // original version:

exports.getReviewsHelpful = (id, count, page) => {
  const text = `SELECT id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness
                FROM reviews
                WHERE product_id = $1
                ORDER BY helpfulness DESC
                LIMIT $2
                OFFSET ($3 - 1) * $2`;
  const params = [id, count, page];
  return db.query(text, params);
};

exports.getReviewsNewest = (id, count, page) => {
  const text = `SELECT id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness
                FROM reviews
                WHERE product_id = $1
                ORDER BY date DESC
                LIMIT $2
                OFFSET ($3 - 1) * $2`;
  const params = [id, count, page];
  return db.query(text, params);
};

exports.getReviewsRelevant = (id, count, page) => {
  const text = `SELECT id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness
                FROM reviews
                WHERE product_id = $1
                ORDER BY relevance DESC
                OFFSET ($3 - 1) * $2`;
  const params = [id, count, page];
  return db.query(text, params);
};

exports.getReviewsRelevant = (id, count, page) => {
  const text = `SELECT id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness
                FROM (
                    SELECT *, RANK() OVER (ORDER BY helpfulness DESC) rank_helpfulness, RANK() OVER (ORDER BY date DESC) rank_date
                    FROM reviews
                    WHERE product_id = $1 ) t
                ORDER BY t.rank_helpfulness + t.rank_date ASC
                OFFSET ($3 - 1) * $2`;
  const params = [id, count, page];
  return db.query(text, params);
};


// // using create materialized view and join table:
// CREATE MATERIALIZED VIEW mv_review_tb
// AS
// SELECT r.product, r.review_id, r.rating, r.summary, r.recommend, r.response, r.body, r.date, r.reviewer_name, r.helpfulness, rp.photos
//                 FROM reviews r
//                 FULL OUTER JOIN (
//                                   SELECT review_id, jsonb_agg(jsonb_build_object('id', id, 'url', url)) photos
//                                   FROM reviews_photos
//                                   GROUP BY review_id
//                                 ) rp
//                 ON r.review_id = rp.review_id

// exports.getReviewsHelpful = (id, count, page) => {
//   const text = `SELECT review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness, photos
//                 FROM mv_review_tb
//                 WHERE product = $1
//                 ORDER BY helpfulness DESC
//                 LIMIT $2
//                 OFFSET ($3 - 1) * $2`;
//   const params = [id, count, page];
//   return db.query(text, params);
// };


// exports.getReviewsNewest = (id, count, page) => {
//   const text = `SELECT review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness, photos
//                 FROM mv_review_tb
//                 WHERE product = $1
//                 ORDER BY date DESC
//                 LIMIT $2
//                 OFFSET ($3 - 1) * $2`;
//   const params = [id, count, page];
//   return db.query(text, params);
// };

// exports.getReviewsRelevant = (id, count, page) => {
//   const text = `SELECT review_id, rating, summary, recommend, response, body, date, reviewer_name, helpfulness, photos
//                 FROM mv_review_tb
//                 WHERE product = $1
//                 ORDER BY
//                 CASE WHEN (date_part('year', (SELECT current_timestamp)) - EXTRACT(YEAR FROM date) <= 2)
//                      THEN helpfulness END DESC,
//                 CASE WHEN (date_part('year', (SELECT current_timestamp)) - EXTRACT(YEAR FROM date) > 2)
//                      THEN date END DESC
//                 LIMIT $2
//                 OFFSET ($3 - 1) * $2`;
//   const params = [id, count, page];
//   return db.query(text, params);
// };

// test1:
// const text = `SELECT r.product, r.helpfulness, rp.photo_id, rp.url, rp.review_id FROM reviews as r JOIN reviews_photos as rp ON r.id = rp.review_id WHERE $1 IS NULL or r.product = $1`;

// test2:
// const text = `SELECT rp.review_id, r.rating, r.summary, r.recommend, r.response, r.body, r.date, r.reviewer_name, r.helpfulness, rp.photo_id, rp.url FROM reviews r JOIN reviews_photos as rp ON r.id = rp.review_id WHERE $1::integer IS NULL or r.product = $1::integer`;

// original:
// const text = `SELECT r.product, r.rating, r.summary, r.recommend, r.response, r.body, r.date, r.reviewer_name, r.helpfulness, rp.photo_id, rp.url, rp.review_id FROM reviews r JOIN reviews_photos as rp ON r.id = rp.review_id WHERE $1::integer IS NULL or r.product = $1::integer`;


// // original:
// exports.getPhotos = (reviewId) => {
//   const text = `SELECT id, url
//                 FROM reviews_photos
//                 WHERE review_id = $1`;
//   const params = [reviewId];
//   return db.query(text, params);
// };

// // new1:
// exports.getPhotos = (reviewId) => {
//   const text = `SELECT jsonb_agg(jsonb_build_object('id', id, 'url', url)) photos
//                 FROM reviews_photos
//                 WHERE review_id = $1
//                 GROUP BY review_id`;
//   const params = [reviewId];
//   return db.query(text, params);
// };



// // Meta:
// // mew method:

// // //: STEP1-create materialized tb:

// CREATE MATERIALIZED VIEW mv_reviews_meta_tb
// 		AS
// 		SELECT s11.product, s11.ratings, s22.recommended, s5.characteristics
// 		FROM (
//   			select json_object_agg(rating, cnt1) as ratings, product
//   			from (
//   				select rating, count(rating) cnt1, product
//   				from reviews
//   				group by 1, 3
// 		  	) s1
// 			where s1.product IS NOT NULL
// 			group by s1.product
//         ) s11
// 		FULL OUTER JOIN (
//   				select json_object_agg(recommend, cnt2) as recommended, product
//   				from (
//   					select recommend, count(recommend) cnt2, product
//     				from reviews
//     				group by 1, 3
// 				) s2
// 			where s2.product IS NOT NULL
// 			group by s2.product
// 		 ) s22
// 		ON s11.product = s22.product
// 		FULL OUTER JOIN (
// 				select json_object_agg(s4.name, s4.obj) as characteristics, s4.product_id
//   				from (
//     				select s3.name, json_build_object('id', s3.id, 'value', s3.avg) obj, s3.product_id
//     				from (
//     					select c.name, c.id, AVG(cr.value) avg, product_id
//     					from characteristic_reviews cr
//     					join characteristics c
//     					on cr.characteristic_id = c.id
//     					group by 2, 4
//     				) s3
// 					group by 1, s3.id, s3.avg, 3
// 					order by 3
//                  ) s4
// 			    where s4.product_id IS NOT NULL
// 			    group by 2
// 			) s5
// 		ON COALESCE(s11.product, s22.product) = s5.product_id

// // // STEP2:
exports.getReviewsMeta = (id) => {
  const text = 'SELECT ratings, recommended, characteristics FROM mv_reviews_meta_tb WHERE product_id = $1';
  const params = [id];
  return db.query(text, params);
};

// // previous method:
// exports.getRatings = (id) => {
//   const text = `SELECT rating, count(rating)
//                 FROM reviews
//                 WHERE product = $1
//                 GROUP BY rating`;
//   const params = [id];
//   return db.query(text, params);
// };


// exports.getRecommended = (id) => {
//   const text = `SELECT recommend, count(recommend)
//                 FROM reviews
//                 WHERE product = $1
//                 GROUP BY recommend`;
//   const params = [id];
//   return db.query(text, params);
// };


// exports.getCharacteristics = async (id) => {
// // approach 3:
//   const text1 = `SELECT c.id, c.name
//     FROM characteristics c
//     WHERE product_id = $1`;
//   const params = [id];
//   const cIdName = await db.query(text1, params);
//   const arr = cIdName.rows;

//   const newArr = await arr.map(async (obj) => {
//     // console.log('obj', obj);
//     const text2 = `SELECT AVG(value) FROM characteristic_reviews WHERE characteristic_id = ${obj.id}`;
//     const result2 = await db.query(text2);
//     const avg = result2.rows[0];
//     // console.log('avg', result2.rows[0]);
//     const newObj = Object.assign(obj, avg);
//     // console.log('updated obj', newObj);
//     return newObj;
//   });

//   return Promise.all(newArr).then((bigBox) => bigBox);

// // ref: https://stackoverflow.com/questions/43453685/json-agg-two-columns-in-postgres
// select json_object_agg(rating, cnt1)
// from (
// select rating, count(rating) cnt1
// from reviews
// where product = 71702
// group by 1
// ) s1;

// select json_object_agg(recommend, cnt2)
// from (
//   select recommend, count(recommend) cnt2
//   from reviews
//   where product = 71702
//   group by 1
// ) s2;

// select json_object_agg(s4.name, s4.obj) characteristics
// from (
//   select s3.name, json_build_object('id', s3.id, 'value', s3.avg) obj
//   from (
//   select c.name, c.id, AVG(cr.value) avg
//   from characteristic_reviews cr
//   join characteristics c
//   on cr.characteristic_id = c.id
//   where product_id = 99910
//   group by 2
//   ) s3
// ) s4


// console.log('arr', newArr);
// return newArr;

// // original:
// const text = `SELECT c.id, AVG(cr.value), c.name
//               FROM characteristic_reviews as cr
//               JOIN characteristics as c
//               ON cr.characteristic_id = c.id
//               WHERE product_id = $1
//               GROUP BY c.id`;
// const params = [id];
// const result = await db.query(text, params);
// console.log('result.rows', result.rows);
// return db.query(text, params);



// slowest:
// ref: https://mode.com/sql-tutorial/sql-performance-tuning/
// const text = `SELECT c.name, sub.*
//               FROM (
//                 SELECT cr.characteristic_id, AVG(cr.value)
//                 FROM characteristic_reviews cr
//                 GROUP BY cr.characteristic_id
//               ) sub
//               JOIN characteristics c
//               ON sub.characteristic_id = c.id
//               WHERE product_id = $1`;

// };

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


