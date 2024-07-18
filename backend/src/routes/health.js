const express = require('express');
const router = express.Router();
const db = require('../config/database');
const redis = require('../config/redis');
const logger = require('../utils/logger');

router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await db.query('SELECT 1');
    
    // Check Redis connection
    await redis.set('health_check', 'OK');
    const redisResult = await redis.get('health_check');
    
    if (redisResult !== 'OK') {
      throw new Error('Redis check failed');
    }
    
    res.status(200).json({ status: 'healthy' });
  } catch (error) {
    logger.error('Health check failed', { error });
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

module.exports = router;