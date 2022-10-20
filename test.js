const request = require('supertest');
const app = require('./app');

// Thanks for Abdiel sharing this super helpful link with us:
// https://www.albertgao.xyz/2017/05/24/how-to-test-expressjs-with-jest-and-supertest/
describe('Test the root path', () => {
  test('It should response the GET method', (done) => {
    request(app)
      .get('/')
      .then((response) => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });
});

describe('/reviews', () => {
  test('It should return 5 reviews when no count is specified', async () => {
    const response = await request(app).get('/reviews?product_id=20');
    expect(response.body.results.length).toBe(5);
  });

  test('It should order by helpfulness DESC when sorting by helpfulness', async () => {
    const response = await request(app).get('/reviews?product_id=20&sort=helpful');
    response.body.results.forEach((review, index, array) => {
      if (index + 1 < array.length) {
        expect(array[index + 1].helpfulness).toBeLessThan(review.helpfulness);
      }
    });
  });

  test('It should order by newest when sorting by newest', async () => {
    const response = await request(app).get('/reviews?product_id=20&sort=newest');
    response.body.results.forEach((review, index, array) => {
      if (index + 1 < array.length) {
        expect(Date.parse(array[index + 1].date)).toBeLessThan(Date.parse(review.date));
      }
    });
  });
});

describe('/meta', () => {
  test('It should have at most 5 ratings level', async () => {
    const response = await request(app).get('/reviews/meta?product_id=20');
    expect(Object.keys(response.body.ratings).length).toBeLessThanOrEqual(5);
  });

  test('It should have at most 4 characteristics being valued', async () => {
    const response = await request(app).get('/reviews/meta?product_id=20');
    expect(Object.keys(response.body.characteristics).length).toBeLessThanOrEqual(4);
  });
});

// // initial test:
// describe('Example Test', () => {
//   const plus = (a, b) => a + b;

//   it('Should add two numbers together', () => {
//     expect(plus(2, 6)).toBe(8);
//   });
// });
