const express = require('express');

const app = express();
const router = require('./routes');

app.use(express.json());
app.use(router);

app.get('/', (req, res) => {
  res.status(200).send('System Design Project: Ratings & Reviews API!');
});

module.exports = app;
