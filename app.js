const express = require('express');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(routes);

app.get('/', (req, res) => {
  res.status(200).send('Ratings & Reviews SDC!');
});

module.exports = app;

// So you want to allow each test file to start a server on their own. To do this,
// you need to export app without listening to it.
// https://dev.to/mhmdlotfy96/testing-nodejs-express-api-with-jest-and-supertest-1bk0
