const { createClient } = require('redis');
const dotenv = require('dotenv');
dotenv.config();

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

client.on('error', (err) => console.error('Redis error:', err));

client.connect();

module.exports = client;