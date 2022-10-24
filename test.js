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

describe('GET /reviews', () => {
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

describe('GET /reviews/meta', () => {
  test('It should have at most 5 ratings level', async () => {
    const response = await request(app).get('/reviews/meta?product_id=20');
    expect(Object.keys(response.body.ratings).length).toBeLessThanOrEqual(5);
  });

  test('It should have at most 4 characteristics being valued', async () => {
    const response = await request(app).get('/reviews/meta?product_id=20');
    expect(Object.keys(response.body.characteristics).length).toBeLessThanOrEqual(4);
  });
});

// describe('POST /reviews', () => {
//   const sample = {
//     product_id: 20,
//     rating: 1,
//     summary: 'JEST: testing summary on Oct 24',
//     body: 'JEST: testing body on Oct 24',
//     recommend: true,
//     name: 'dns&alf_happycouple',
//     email: 'dns&alf_happycouple@gmail.com',
//     photos: ['https://res.cloudinary.com/dc3r923zh/image/upload/v1662976828/f6koofaj/nfk3woinnnuuef8k3yau.jpg',
//       'https://res.cloudinary.com/dc3r923zh/image/upload/v1663614601/f6koofaj/ftmiztaicuayaag27glh.jpg',
//       'https://res.cloudinary.com/dc3r923zh/image/upload/v1663614585/f6koofaj/plguf143cdec8z5y8ks7.jpg'],
//     characteristics: {
//       1234577: 2,
//       1234578: 3,
//       1234579: 5,
//       1234580: 1,
//     },
//   };
//   test('POST', async () => {
//     const response = await request(app).post('/reviews').send(sample);
//     expect(response.statusCode).toBe(201);
//   });
// });

// // initial test:
// describe('Example Test', () => {
//   const plus = (a, b) => a + b;

//   it('Should add two numbers together', () => {
//     expect(plus(2, 6)).toBe(8);
//   });
// });
