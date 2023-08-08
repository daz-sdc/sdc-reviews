
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
    ADD COLUMN rank_helpfulness BIGINT,
    ADD COLUMN rank_date BIGINT,
    ADD COLUMN relevance BIGINT;

-- -- experimental queries:

do
$$
BEGIN
  FOR review_id in 1..(SELECT COUNT(id) FROM reviews) LOOP
    INSERT INTO reviews (rank_helpfulness)
        (SELECT rank FROM (
          SELECT id, rank() OVER (PARTITION BY product_id ORDER BY helpfulness DESC)
          FROM reviews
        ) t
        WHERE id = review_id) ON CONFLICT ON CONSTRAINT reviews_pkey
        DO NOTHING;
  END LOOP;
END;
$$;



-- small table test
CREATE TABLE test (
  id SERIAL UNIQUE,
  helpfulness INTEGER NULL DEFAULT NULL,
  date DATE NULL DEFAULT NULL,
  PRIMARY KEY(id)
)

INSERT INTO test VALUES
  (1, 6, '2021-03-28'),
  (2, 2, '2021-02-11'),
  (3, 16, '2020-01-22'),
  (4, 8, '2023-05-01');

ALTER TABLE test
    ADD COLUMN rank_helpfulness INTEGER,
    ADD COLUMN city VARCHAR;

update test SET city='A' WHERE id = 1;
update test SET city='B' WHERE id = 2;
update test SET city='A' WHERE id = 3;
update test SET city='A' WHERE id = 4;

INSERT INTO test (id, helpfulness, date, city) VALUES
  (5, 9, '2022-03-28', 'C'),
  (6, 3, '2020-02-11', 'A'),
  (7, 10, '2021-01-22', 'B'),
  (8, 2, '2023-05-29', 'A');

do
$$
BEGIN
  FOR iid in 1..(SELECT COUNT(id) FROM test) LOOP
    INSERT INTO test (rank_helpfulness)
        (SELECT rank FROM (
          SELECT id, rank() OVER (PARTITION BY city ORDER BY helpfulness DESC)
          FROM test
        ) t
        WHERE id = iid) ON CONFLICT ON CONSTRAINT test_pkey
        DO NOTHING;
  END LOOP;
END;
$$;


do
$$
BEGIN
  FOR iid in 1..(SELECT COUNT(id) FROM test) LOOP
    UPDATE test SET rank_helpfulness =
    (SELECT rank FROM (SELECT id, rank() OVER (PARTITION BY city ORDER BY helpfulness DESC) FROM test) t WHERE id = iid);
  END LOOP;
END;
$$;

alter table test drop column rank_helpfulness;
ALTER TABLE test ADD COLUMN rank_helpfulness INTEGER;

do
$$
BEGIN
  FOR iid in 1..(SELECT COUNT(id) FROM test) LOOP
    UPDATE test SET rank_helpfulness = iid + 100 WHERE id = iid;
  END LOOP;
END;
$$;


do
$$
BEGIN
  FOR iid in 1..(SELECT COUNT(id) FROM test) LOOP
    UPDATE test SET rank_helpfulness = (SELECT rank FROM (SELECT id, rank() OVER (PARTITION BY city ORDER BY helpfulness DESC) FROM test) t WHERE id = iid) WHERE id = iid;
  END LOOP;
END;
$$;