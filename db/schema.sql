
-- Table 'Reviews'

CREATE TABLE reviews (
  review_id SERIAL,
  product_id INTEGER NULL DEFAULT NULL,
  rating INTEGER NULL DEFAULT NULL,
  date BIGINT NULL DEFAULT NULL,
  summary VARCHAR NULL DEFAULT NULL,
  body VARCHAR NULL DEFAULT NULL,
  recommend BOOLEAN NULL DEFAULT NULL,
  reported BOOLEAN NULL DEFAULT NULL,
  reviewer_name VARCHAR NULL DEFAULT NULL,
  reviewer_email VARCHAR NULL DEFAULT NULL,
  response VARCHAR NULL DEFAULT NULL,
  helpfulness INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (review_id)
);

-- Table 'Characteristics'

CREATE TABLE characteristics (
  id SERIAL,
  product_id INTEGER NULL DEFAULT NULL,
  name VARCHAR NULL DEFAULT NULL,
  PRIMARY KEY (id)
);


-- Table 'Characteristic_reviews'

CREATE TABLE characteristic_reviews (
  id SERIAL,
  characteristic_id INTEGER NULL DEFAULT NULL,
  review_id INTEGER NULL DEFAULT NULL,
  value INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (characteristic_id)
      REFERENCES characteristics (id),
  FOREIGN KEY (review_id)
      REFERENCES reviews (review_id)
);

-- Table 'Reviews_photos'

CREATE TABLE reviews_photos (
  id SERIAL,
  review_id INTEGER NULL DEFAULT NULL,
  url VARCHAR NULL DEFAULT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (review_id)
      REFERENCES reviews (review_id)
);

-- after inserting data into tables:

ALTER TABLE reviews
    ALTER COLUMN date TYPE timestamp with time zone
    USING
         timestamp with time zone 'epoch' + date * interval '1 millisecond';

-- Create Materialized Views

CREATE MATERIALIZED VIEW mat_view_reviews
AS
SELECT r.*,
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
ON rp.review_id = r.review_id;



CREATE MATERIALIZED VIEW mat_view_metadata
AS
SELECT
	s1.product_id, s1.ratings, s2.recommended, s3.characteristics
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
ON s3.product_id = s1.product_id;


-- Create Indices

CREATE INDEX idx_mat_view_reviews_product_id ON mat_view_reviews(product_id);

CREATE INDEX idx_mat_view_metadata_product_id ON mat_view_metadata(product_id);


-- Sync primary key sequences:
SELECT setval('reviews_id_seq', (SELECT MAX(review_id) FROM reviews));
SELECT setval('reviews_photos_id_seq', (SELECT MAX(id) FROM reviews_photos));
SELECT setval('characteristics_id_seq', (SELECT MAX(id) FROM characteristics));
SELECT setval('characteristic_reviews_id_seq', (SELECT MAX(id) FROM characteristic_reviews));


-- drop materialized views and then create indices on tables:

---- speed up from 6.29s to 3.10s
CREATE INDEX idx_productid_and_reviewid ON reviews(product_id, review_id);
CREATE INDEX idx_review_id ON reviews_photos(review_id);

---- speed up from 1016ms to 21ms for quering metadata:
CREATE INDEX idx_productid_char ON characteristics(product_id);
CREATE INDEX idx_charid_char_reviews ON characteristic_reviews(characteristic_id);