/* eslint-disable no-unused-vars */
/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-console */


// Don't understand:
// require('dotenv').config();
// const { Pool } = require('pg'); //connection

// const pool = new Pool();

// module.exports = {
//   async query(text, params) {
//     const start = Date.now();
//     const res = await pool.query(text, params);
//     const duration = Date.now() - start;
//     console.log('executed query', { text, duration, rows: res.rowCount });
//     return res;
//   },

//   async getClient() {
//     const client = await pool.connect();
//     const { query } = client;
//     const { release } = client;
//     // set a timeout of 5 seconds, after which we will log this client's last query
//     const timeout = setTimeout(() => {
//       console.error('A client has been checked out for more than 5 seconds!');
//       console.error(`The last executed query on this client was: ${client.lastQuery}`);
//     }, 5000);
//     // monkey patch the query method to keep track of the last query executed
//     client.query = (...args) => {
//       client.lastQuery = args;
//       return query.apply(client, args);
//     };
//     client.release = () => {
//       // clear our timeout
//       clearTimeout(timeout);
//       // set the methods back to their old un-monkey-patched version
//       client.query = query;
//       client.release = release;
//       return release.apply(client);
//     };
//     return client;
//   },
// };

const { Pool } = require('pg');

const pool = new Pool({
  user:'postgres',
  password: '',
  database: 'hello123',
  host: 'localhost',
});







// // Ref video: https://www.youtube.com/watch?v=ufdHsFClAk0:
// // step1: connect to the database:
// const { Client } = require('pg');
// // <--destructure verison, and it same as: const Client = require('pg').Client;
// const client = new Client({
//   user: 'postgres',
//   password: '',
//   host:
// });

