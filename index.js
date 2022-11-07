/* eslint-disable no-console */
const newrelic = require('newrelic');
require('dotenv').config();
const app = require('./app');

const { PORT } = process.env;

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
