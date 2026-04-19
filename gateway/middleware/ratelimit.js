const redis = require('../redis');

const WINDOW_MS = 60 * 1000;  // 60 seconds
const MAX_REQUESTS = 100;      // per window

module.exports = async function rateLimit(ip) {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const key = `rate:${ip}`;

  await redis.zRemRangeByScore(key, 0, windowStart);  // remove old entries
  await redis.zAdd(key, { score: now, value: `${now}` });  // add current request
  await redis.expire(key, 60);  // auto-delete key after 60s

  const count = await redis.zCard(key);  // count requests in window

  return count <= MAX_REQUESTS;  // true = allowed, false = blocked
};