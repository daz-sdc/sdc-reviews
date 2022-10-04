/* eslint-disable arrow-parens */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
require('dotenv').config();
const db = require('./index');

const { DATA_PATH } = process.env;

const loadReviews = () => {
  const path = `${DATA_PATH}reviews.csv`;
  const text = `COPY reviews(id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) FROM '${path}' DELIMITER ',' CSV HEADER`;

  db.query(text)
    .then(res => console.log(res))
    .catch(err => console.log(err));
};

const loadCharacteristics = () => {
  const path = `${DATA_PATH}characteristics.csv`;
  const text = `COPY characteristics(id, product_id, name) FROM '${path}' DELIMITER ',' CSV HEADER`;

  db.query(text)
    .then(res => console.log(res))
    .catch(err => console.log(err));
};

const loadCharacteristicReviews = () => {
  const path = `${DATA_PATH}characteristic_reviews.csv`;
  const text = `COPY characteristic_reviews(id, characteristic_id, review_id, value) FROM '${path}' DELIMITER ',' CSV HEADER`;

  db.query(text)
    .then(res => console.log(res))
    .catch(err => console.log(err));
};

const loadReviewsPhotos = () => {
  const path = `${DATA_PATH}reviews_photos.csv`;
  const text = `COPY reviews_photos(id, review_id, url) FROM '${path}' DELIMITER ',' CSV HEADER`;

  db.query(text)
    .then(res => console.log(res))
    .catch(err => console.log(err));
};
