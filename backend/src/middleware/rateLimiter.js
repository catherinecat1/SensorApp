const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('../config/redis');

const limiter = rateLimit({
  store: new RedisStore({
    client: redis.client,
    prefix: 'rate_limit:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // limit each IP to 10000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  headers: true,
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.ip;
  },
  skip: (req) => {
    return req.path === '/health' || req.ip === '127.0.0.1';
  }
});

module.exports = limiter;