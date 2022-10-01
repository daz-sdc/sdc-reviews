/* eslint-disable no-console */
require('dotenv').config();
const app = require('./app');

const { PORT } = process.env;

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.listen(5768, () => {
//   console.log('Example app listening on port 5678!');
// });
