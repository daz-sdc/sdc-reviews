import http from 'k6/http';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  discardResponseBodies: true,
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 1000,
      timeUnit: '1s',
      duration: '10s',
      preAllocatedVUs: 10,
      maxVUs: 100,
    },
  },
};

export default () => {
  const i = randomIntBetween(900000, 1000000);
  const url = `http://localhost:8000/reviews/meta?product_id=${i}`;
  console.log('***url***', url);
  http.get(url);
};
