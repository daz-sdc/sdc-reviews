
-- Table 'Reviews'

CREATE TABLE reviews (
  id SERIAL UNIQUE,
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
  PRIMARY KEY (id)
);

-- Table 'Characteristics'

CREATE TABLE characteristics (
  id SERIAL UNIQUE,
  product_id INTEGER NULL DEFAULT NULL,
  name VARCHAR NULL DEFAULT NULL,
  PRIMARY KEY (id)
);


-- Table 'Characteristic_reviews'

CREATE TABLE characteristic_reviews (
  id SERIAL UNIQUE,
  characteristic_id INTEGER NULL DEFAULT NULL,
  review_id INTEGER NULL DEFAULT NULL,
  value INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (characteristic_id)
      REFERENCES characteristics (id),
  FOREIGN KEY (review_id)
      REFERENCES reviews (id)
);

-- Table 'Reviews_photos'

CREATE TABLE reviews_photos (
  id SERIAL UNIQUE,
  review_id INTEGER NULL DEFAULT NULL,
  url VARCHAR NULL DEFAULT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (review_id)
      REFERENCES reviews (id)
);

-- after inserting data into tables:

ALTER TABLE reviews
    ALTER COLUMN date TYPE timestamp with time zone
    USING
         timestamp with time zone 'epoch' + date * interval '1 millisecond';

ALTER TABLE reviews
    ADD COLUMN rank_helpfulness INTEGER,
    ADD COLUMN rank_date INTEGER,
    ADD COLUMN relevance INTEGER;

ALTER TABLE reviews RENAME COLUMN id TO review_id;


-- Create Indices
CREATE INDEX idx_product_id ON reviews(product_id);
DROP INDEX idx_product_id;

CREATE INDEX idx_mv_reviews_tb_product_id ON mv_reviews_tb(product_id);


-- Create Materialized Views

CREATE MATERIALIZED VIEW mv_reviews_tb
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

CREATE MATERIALIZED VIEW mv_meta_tb
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



-- -- experimental queries:

SELECT jsonb_build_object('1', '3', '2', '1', '3', '1', '4', '2', '5', '8');

SELECT c.product_id, cr.characteristic_id, c.name, cr.value FROM characteristic_reviews cr
RIGHT JOIN characteristics c
ON cr.characteristic_id = c.id
WHERE c.product_id < 5;

SELECT c.product_id, cr.value, COUNT(cr.value)
FROM characteristic_reviews cr
LEFT JOIN characteristics c
ON cr.characteristic_id = c.id
WHERE c.product_id < 5
GROUP BY cr.value, c.product_id
ORDER BY c.product_id;

SELECT c.product_id,
jsonb_build_object(
cr.value, COUNT(cr.value)
)
FROM characteristic_reviews cr
LEFT JOIN characteristics c
ON cr.characteristic_id = c.id
WHERE c.product_id < 5
GROUP BY cr.value, c.product_id
ORDER BY c.product_id;

SELECT
product_id,
jsonb_object_agg (value, count) ratings
FROM (
SELECT c.product_id, cr.value, COUNT(cr.value)
FROM characteristic_reviews cr
LEFT JOIN characteristics c
ON cr.characteristic_id = c.id
WHERE c.product_id < 10
GROUP BY cr.value, c.product_id
ORDER BY c.product_id
) t
GROUP BY product_id;

SELECT product_id, recommend, COUNT(recommend)
FROM reviews
WHERE product_id < 10
GROUP BY product_id, recommend
ORDER BY product_id;

SELECT
product_id,
jsonb_object_agg (recommend, count) recommended
FROM (
SELECT product_id, recommend, COUNT(recommend)
FROM reviews
WHERE product_id < 10
GROUP BY product_id, recommend
ORDER BY product_id
) t
GROUP BY product_id;

SELECT s1.product_id, s1.ratings, s2.recommended
FROM (
SELECT
product_id, jsonb_object_agg (value, count) AS ratings
FROM (
SELECT
c.product_id, cr.value, COUNT(cr.value)
FROM  characteristic_reviews cr
LEFT JOIN characteristics c
ON cr.characteristic_id = c.id
GROUP BY c.product_id, cr.value
) s11
GROUP BY s11.product_id
) s1
FULL OUTER JOIN (
SELECT product_id, jsonb_object_agg (recommend, count) AS recommended
FROM (
SELECT
product_id, recommend, COUNT(recommend)
FROM reviews
GROUP BY product_id, recommend
) s22
GROUP BY s22.product_id
) s2
ON s1.product_id = s2.product_id
GROUP BY s1.product_id;


SELECT c.product_id, c.id, cr.value
FROM characteristic_reviews cr
LEFT JOIN characteristics c
ON cr.characteristic_id = c.id
WHERE c.product_id < 10;


SELECT c.product_id, c.id as char_id, c.name, cast(sum(cr.value) as decimal) / count(c.id) as value
FROM characteristic_reviews cr
LEFT JOIN characteristics c
ON cr.characteristic_id = c.id
WHERE c.product_id < 10
GROUP BY char_id, c.product_id;


SELECT product_id, jsonb_build_object('id', char_id, 'value', value)
FROM (
	SELECT c.product_id, c.id as char_id, c.name, cast(sum(cr.value) as decimal) / count(c.id) as value
	FROM characteristic_reviews cr
	LEFT JOIN characteristics c
	ON cr.characteristic_id = c.id
	WHERE c.product_id < 10
	GROUP BY char_id, c.product_id
) t


SELECT product_id, jsonb_object_agg(name, overall_characteristics) AS characteristics
FROM (
	SELECT product_id, name, jsonb_build_object('id', char_id, 'value', avg_value) AS overall_characteristics
	FROM (
		SELECT c.product_id, c.id as char_id, c.name, cast(sum(cr.value) as decimal) / count(c.id) as avg_value
		FROM characteristic_reviews cr
		LEFT JOIN characteristics c
		ON cr.characteristic_id = c.id
		WHERE c.product_id < 10
		GROUP BY char_id, c.product_id
	) t
) tt
GROUP BY product_id


SELECT
	s1.product_id, s1.ratings, s2.recommended, s3.characteristics
FROM (
	SELECT
		product_id, jsonb_object_agg (value, count) AS ratings
	FROM (
		SELECT
			c.product_id, cr.value, COUNT(cr.value)
		FROM  characteristic_reviews cr
		LEFT JOIN characteristics c
		ON cr.characteristic_id = c.id
		GROUP BY c.product_id, cr.value
	) s11
	GROUP BY s11.product_id
) s1
FULL OUTER JOIN (
	SELECT
		product_id, jsonb_object_agg (recommend, count) AS recommended
	FROM (
		SELECT
		product_id, recommend, COUNT(recommend)
		FROM reviews
		GROUP BY product_id, recommend
	) s22
	GROUP BY s22.product_id
) s2
ON s1.product_id = s2.product_id
FULL OUTER JOIN (
	SELECT product_id, jsonb_object_agg(name, overall_characteristics) AS characteristics
	FROM (
		SELECT product_id, name, jsonb_build_object('id', char_id, 'value', avg_value) AS overall_characteristics
		FROM (
			SELECT c.product_id, c.id as char_id, c.name, cast(sum(cr.value) as decimal) / count(c.id) as avg_value
			FROM characteristic_reviews cr
			LEFT JOIN characteristics c
			ON cr.characteristic_id = c.id
			GROUP BY char_id, c.product_id
		) t
	) tt
	GROUP BY product_id
) s3
ON s3.product_id = s1.product_id;


