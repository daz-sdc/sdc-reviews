const request = require('supertest');

const app = require('./server/app');

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

// // initial test:
// describe('Example Test', () => {
//   const plus = (a, b) => a + b;

//   it('Should add two numbers together', () => {
//     expect(plus(2, 6)).toBe(8);
//   });
// });
