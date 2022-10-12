-- ---
-- Globals
-- ---

-- SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
-- SET FOREIGN_KEY_CHECKS=0;

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
  photo_id SERIAL UNIQUE,
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

-- ---
-- Table Properties
-- ---

-- ALTER TABLE `Reviews` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `Characteristics` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `Characteristic_reviews` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
-- ALTER TABLE `Reviews_photos` ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- ---
-- Test Data
-- ---

-- INSERT INTO `Reviews` (`id`,`product_id`,`rating`,`date`,`summary`,`body`,`recommend`,`reported`,`reviewer_name`,`reveiwer_email`,`response`,`helpfulness`) VALUES
-- ('','','','','','','','','','','','');
-- INSERT INTO `Characteristics` (`id`,`product_id`,`name`) VALUES
-- ('','','');
-- INSERT INTO `Characteristic_reviews` (`id`,`characteristic_id`,`review_id`,`value`) VALUES
-- ('','','','');
-- INSERT INTO `Reviews_photos` (`id`,`review_id`,`url`) VALUES
-- ('','','');