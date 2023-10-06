
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


-- create indices on tables:

CREATE INDEX idx_productid_and_reviewid ON reviews(product_id, review_id);
CREATE INDEX idx_review_id ON reviews_photos(review_id);
CREATE INDEX idx_productid_char ON characteristics(product_id);
CREATE INDEX idx_charid_char_reviews ON characteristic_reviews(characteristic_id);

-- Sync primary key sequences:
SELECT setval('reviews_review_id_seq', (SELECT MAX(review_id) FROM reviews));
SELECT setval('reviews_photos_id_seq', (SELECT MAX(id) FROM reviews_photos));
SELECT setval('characteristics_id_seq', (SELECT MAX(id) FROM characteristics));
SELECT setval('characteristic_reviews_id_seq', (SELECT MAX(id) FROM characteristic_reviews));

