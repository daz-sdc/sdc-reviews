/* eslint-disable no-unused-vars */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-console */







// Don't understand:
// require('dotenv').config();
// const { Pool } = require('pg'); // connection

// // const connectionString = process.env.CONNECTION_STRING; ??????????

// const pool = new Pool();

// module.exports = {
//   async query(text, params) {
//     const start = Date.now();
//     const res = await pool.query(text, params);
//     const duration = Date.now() - start;
//     console.log('executed query', { text, duration, rows: res.rowCount });
//     return res;
//   },
// };







// // Ref video: https://www.youtube.com/watch?v=ufdHsFClAk0:
// // step1: connect to the database:
// const { Client } = require('pg');
// // <--destructure verison, and it same as: const Client = require('pg').Client;
// const client = new Client({
//   user: 'postgres',
//   password: '',
//   host:
// });


const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'hello123',
  password: 'sdn1993',
  port: 5432,
});

module.exports = {
  async query(text, params) {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('executed query', { text, duration, rows: res.rowCount });
    return res;
  },
};
