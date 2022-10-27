/* eslint-disable max-len */
import http from 'k6/http';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 100, // (required) Number of iterations to start during each timeUnit period.
      timeUnit: '1s', // Number of VUs to pre-allocate before test start to preserve runtime resources. DEFAULT: 1s
      duration: '30s', // (required) Total scenario duration (excluding gracefulStop).
      preAllocatedVUs: 1000, // (required) Number of VUs to pre-allocate before test start to preserve runtime resources.
      maxVUs: 1000, // Maximum number of VUs to allow during the test run. DEFAULT: If unset, same as preAllocatedVUs
    },
  },
};
// REFERENCE LINKs:
// https://k6.io/docs/using-k6/scenarios/executors/constant-arrival-rate/
// https://k6.io/blog/how-to-generate-a-constant-request-rate-with-the-new-scenarios-api/

export default () => {
  const i = randomIntBetween(900000, 1000000);
  // const i = randomIntBetween(5197536, 5775040);
  const url = `http://localhost:8000/reviews?product_id=${i}`;
  console.log('***url***', url);
  http.get(url);
};

// dropped_iterations.............: 48     1.199353/s
// http_req_duration..............: avg=25.61s
