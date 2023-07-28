-- ---
-- Table 'Reviews'
--
-- ---

DROP TABLE IF EXISTS reviews;

CREATE TABLE reviews (
  id SERIAL UNIQUE,
  product_id INTEGER NULL DEFAULT NULL,
  rating INTEGER NULL DEFAULT NULL,
  date TIMESTAMP WITH TIME ZONE NULL DEFAULT NULL,
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

-- ---
-- Table 'Characteristics'
--
-- ---

DROP TABLE IF EXISTS characteristics;

CREATE TABLE characteristics (
  id SERIAL UNIQUE,
  product_id INTEGER NULL DEFAULT NULL,
  name VARCHAR NULL DEFAULT NULL,
  PRIMARY KEY (id)
);

-- ---
-- Table 'Characteristic_reviews'
--
-- ---

DROP TABLE IF EXISTS Characteristic_reviews;

CREATE TABLE characteristic_reviews (
  id SERIAL UNIQUE,
  characteristic_id INTEGER NULL DEFAULT NULL,
  review_id INTEGER NULL DEFAULT NULL,
  value INTEGER NULL DEFAULT NULL,
  PRIMARY KEY (id)
);

-- ---
-- Table 'Reviews_photos'
--
-- ---

DROP TABLE IF EXISTS reviews_photos;

CREATE TABLE reviews_photos (
  id SERIAL UNIQUE,
  review_id INTEGER NULL DEFAULT NULL,
  url VARCHAR NULL DEFAULT NULL,
  PRIMARY KEY (id)
);

-- ---
-- Foreign Keys
-- ---

ALTER TABLE characteristic_reviews ADD FOREIGN KEY (characteristic_id) REFERENCES characteristics (id);
ALTER TABLE characteristic_reviews ADD FOREIGN KEY (review_id) REFERENCES reviews (id);
ALTER TABLE reviews_photos ADD FOREIGN KEY (review_id) REFERENCES reviews (id);
