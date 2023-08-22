require('dotenv').config();

const { Pool } = require('pg');

const {
  PGHOST,
  PGUSER,
  PGPASSWORD,
  PGPORT,
  PGDATABASE,
} = process.env;

const pool = new Pool({
  host: PGHOST,
  user: PGUSER,
  password: PGPASSWORD,
  port: PGPORT,
  database: PGDATABASE,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};