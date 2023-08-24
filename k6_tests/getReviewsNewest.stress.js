/* eslint-disable max-len */
const http = require('k6/http');
const { randomIntBetween } = require('https://jslib.k6.io/k6-utils/1.2.0/index.js');

const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 2000, // (required) Number of iterations to start during each timeUnit period.
      timeUnit: '1s', // Number of VUs to pre-allocate before test start to preserve runtime resources. DEFAULT: 1s
      duration: '60s', // (required) Total scenario duration (excluding gracefulStop).
      preAllocatedVUs: 200, // (required) Number of VUs to pre-allocate before test start to preserve runtime resources.
      maxVUs: 210, // Maximum number of VUs to allow during the test run. DEFAULT: If unset, same as preAllocatedVUs
    },
  },
};

const getReviews = () => {
  const i = randomIntBetween(899800, 1000011);
  http.get(`http://localhost:8000/reviews?product_id=${i}&sort=newest`);
};

module.exports = { options, default: getReviews };
