
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

-- -- experimental queries:


-- this query works but very slow, update 100 records will cost 5min 51s:
do
$$
BEGIN
  FOR review_id in 1..(SELECT COUNT(id) FROM reviews) LOOP
    UPDATE reviews
    SET rank_helpfulness = (SELECT rank FROM (SELECT id, rank() OVER (PARTITION BY product_id ORDER BY helpfulness DESC) FROM reviews) t WHERE id = review_id)
    WHERE id = review_id;
  END LOOP;
END;
$$;





