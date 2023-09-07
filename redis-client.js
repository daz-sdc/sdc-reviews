require('dotenv').config();
const Redis = require('redis');
const client = Redis.createClient();
client.on('error', err => console.log('Redis Client Error', err));

// const redisClient = Redis.createClient({
//   host: process.env.REDISHOST,
//   port: process.env.REDISPORT,
//   password: process.env.REDISPASSWORD
// });

module.exports = client;


