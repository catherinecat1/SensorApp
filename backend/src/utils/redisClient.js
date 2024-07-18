const redis = require('redis');
const { promisify } = require('util');
const logger = require('./logger');

const client = redis.createClient(process.env.REDIS_URL);

client.on('error', (error) => {
  logger.error('Redis Client Error', error);
});

module.exports = {
  get: promisify(client.get).bind(client),
  set: promisify(client.set).bind(client),
  del: promisify(client.del).bind(client),
  client: client,
};