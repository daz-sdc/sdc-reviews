import http from 'k6/http';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  discardResponseBodies: true,
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 2500,
      timeUnit: '1s',
      duration: '60s',
      preAllocatedVUs: 200,
      maxVUs: 210,
    },
  },
};

export default () => {
  const i = randomIntBetween(899800, 1000011);
  const url = `http://localhost:8000/reviews/meta?product_id=${i}`;
  http.get(url);
};
