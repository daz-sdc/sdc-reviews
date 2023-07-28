const express = require('express');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(routes);

app.get('/', (req, res) => {
  res.status(200).send('Ratings & Reviews SDC!');
});

module.exports = app;
