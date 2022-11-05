/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-unused-vars */
/* eslint-disable import/newline-after-import */
/* eslint-disable max-len */
const express = require('express');
const routes = require('./routes');
const app = express();

app.use(express.json());
app.use(routes);

app.get('/', (req, res) => {
  res.status(200).send('Ratings & Reviews SDC!');
});

// app.get('/loaderio-dd5239fa792bd574d3bc6a8196f85b08.txt', (req, res) => {
//   res.status(200).send('loaderio-dd5239fa792bd574d3bc6a8196f85b08');
// });

module.exports = app;

// So you want to allow each test file to start a server on their own. To do this, you need to export app without listening to it.
// https://dev.to/mhmdlotfy96/testing-nodejs-express-api-with-jest-and-supertest-1bk0
