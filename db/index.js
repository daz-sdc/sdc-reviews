require('dotenv').config();

const pgpassword = process.env.PGPASSWORD;

const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'hello123',
  password: pgpassword,
  port: 5432,
});

module.exports = {
  async query(text, params) {
    const res = await pool.query(text, params);
    return res;
  },
};
