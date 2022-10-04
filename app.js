/* eslint-disable max-len */
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.status(200).send('Hello World!');
});

module.exports = app;

// So you want to allow each test file to start a server on their own. To do this, you need to export app without listening to it.
// https://dev.to/mhmdlotfy96/testing-nodejs-express-api-with-jest-and-supertest-1bk0

// Data from POSTMAN:
// {
//   "product": "71701",
//   "page": 0,
//   "count": 200,
//   "results": [
//       {
//           "review_id": 1276722,
//           "rating": 5,
//           "summary": "I love this!",
//           "recommend": true,
//           "response": null,
//           "body": "I can't wait to show all my friends. This is the best ever!",
//           "date": "2022-09-10T00:00:00.000Z",
//           "reviewer_name": "SamIAm",
//           "helpfulness": 30,
//           "photos": [
//               {
//                   "id": 2456187,
//                   "url": "http://res.cloudinary.com/red-bean-rulez/image/upload/v1662780449/FEC_project/m4apunrxwilu1535vi87.jpg"
//               }
//           ]
//       }
//   ]
// }
