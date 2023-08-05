
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


ALTER TABLE reviews
    ALTER COLUMN date TYPE timestamp with time zone
    USING
         timestamp with time zone 'epoch' + date * interval '1 millisecond';

ALTER TABLE reviews
    ADD COLUMN percentage_helpfulness NUMERIC;



-- experimental queries:

SELECT CAST(helpfulness as decimal)/(max(helpfulness) over (PARTITION BY product_id)) FROM reviews WHERE product_id = 20;

do $$
BEGIN
  for index in 1..(SELECT COUNT(*) FROM reviews) loop
  INSERT INTO reviews(percentage_helpfulness) VALUES
  (SELECT CAST(helpfulness as decimal)/(max(helpfulness) over (PARTITION BY product_id)) FROM reviews WHERE reviews.id = index);
  END LOOP;
END; $$


REF: https://stackoverflow.com/questions/4448340/postgresql-duplicate-key-violates-unique-constraint#:~:text=13%20Answers
s1. SELECT MAX(id) FROM reviews;
s2. SELECT nextval('reviews_id_seq');
s3. SELECT setval('reviews_id_seq', (SELECT MAX(id) FROM reviews)+1);
s4.
DO
$do$
BEGIN
  for index in 1..(SELECT COUNT(*) FROM reviews) loop
  INSERT INTO reviews (percentage_helpfulness) VALUES (0.6897);
  END LOOP;
END;
$do$;

Before doing s4, there were 5774952 rows
After that, there are 11549906 rows, and testing number 0.6897 could only inserted into 5774953-11549906 rows
