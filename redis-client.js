// require('dotenv').config();
// const Redis = require('redis');

// const redisClient = Redis.createClient({
//   host: process.env.REDIS_HOST,
//   port: process.env.REDIS_PORT,
//   password: process.env.REDIS_PASSWORD
// });

// const { promisify } = require('util');
// const connectAsync = promisify(redisClient.connect).bind(redisClient);
// const quitAsync = promisify(redisClient.quit).bind(redisClient);
// const setAsyncEx = promisify(redisClient.set).bind(redisClient);
// const getAsync = promisify(redisClient.get).bind(redisClient);

// redisClient.on('error', err => console.log('Redis Client Error', err));

// async function saveWithTtl(key, value, ttlSeconds = 10) {
//   return await setAsyncEx(key, JSON.stringify(value), 'EX', ttlSeconds)
// }

// async function get(key) {
//   const jsonString = await getAsync(key);
//   if (jsonString) {
//     return JSON.parse(jsonString);
//   }
// }

// async function connect() {
//   await connectAsync();
// }

// async function quit() {
//   await quitAsync();
// }

// module.exports = {connect, quit, saveWithTtl, get};



// require('dotenv').config();
// const Redis = require('redis');

// const redisClient = Redis.createClient({
//   host: process.env.REDIS_HOST,
//   port: process.env.REDIS_PORT,
//   password: process.env.REDIS_PASSWORD
// });

// redisClient.on('error', err => console.log('Redis Client Error', err));

// module.exports = { redisClient };



