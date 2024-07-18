const db = require('../config/database');
const redis = require('../config/redis');
const logger = require('../utils/logger');
const CACHE_TTL = 550; // 550 seconds, slightly less than our 10-minute polling interval

const SensorData = {
  async insert(equipmentId, timestamp, value) {
    const query = `
      INSERT INTO sensor_data (equipment_id, timestamp, value)
      VALUES ($1, $2, $3)
      ON CONFLICT (equipment_id, timestamp)
      DO UPDATE SET value = EXCLUDED.value
      RETURNING *
    `;
    const values = [equipmentId, timestamp, value];
    try {
      const result = await db.query(query, values);

      // Asynchronously invalidate cache
      this.invalidateCache(equipmentId).catch(err => 
        logger.error('Error invalidating cache', { error: err, equipmentId })
      );

      return result.rows[0];
    } catch (error) {
      logger.error('Error inserting sensor data', { error, equipmentId, timestamp, value });
      throw error;
    }
  },

  async invalidateCache(equipmentId) {
    const periods = [24, 48, 168, 720];
    for (let period of periods) {
      await redis.del(`avg_data:${period}:${equipmentId}`);
      await redis.del(`avg_data:${period}:all`);
      await redis.del(`latest_data_by_location:${period}:all`);
    }
    await redis.del(`latest_data:24:${equipmentId}`);
    await redis.del(`latest_data:24:all`);
  },

  async getAverageData(period, equipmentId = null) {
    const cacheKey = `avg_data:${period}:${equipmentId || 'all'}`;
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      let query = `
        SELECT 
          date_trunc('hours', timestamp) as hours,
          AVG(value) as average
        FROM sensor_data
        WHERE timestamp > NOW() - INTERVAL '${period} hours'
      `;
      
      const values = [];
      if (equipmentId) {
        query += ' AND equipment_id = $1';
        values.push(equipmentId);
      }
      
      query += ' GROUP BY hours ORDER BY hours';
      
      const result = await db.query(query, values);
      await redis.set(cacheKey, JSON.stringify(result.rows), 'EX', CACHE_TTL);
      return result.rows;
    } catch (error) {
      logger.error('Error getting average sensor data', { error, period, equipmentId });
      throw error;
    }
  },

  async getDataByEquipment(equipmentId, startDate, endDate) {
    const query = `
      SELECT * FROM sensor_data
      WHERE equipment_id = $1
      AND timestamp BETWEEN $2 AND $3
      ORDER BY timestamp
    `;
    const values = [equipmentId, startDate, endDate];
    try {
      const result = await db.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  async getLatestSensorData(hours, equipmentId) {
    const cacheKey = `latest_data:${hours}:${equipmentId || 'all'}`;
    let query = `
      SELECT equipment_id, timestamp, value
      FROM sensor_data
      WHERE timestamp > NOW() - INTERVAL '${hours} hours'
    `;
    
    const values = [];
    if (equipmentId) {
      query += ' AND equipment_id = $1';
      values.push(equipmentId);
    }
    
    query += ' ORDER BY timestamp DESC';
    try {
      const result = await db.query(query, values);
      await redis.set(cacheKey, JSON.stringify(result.rows), 'EX', CACHE_TTL);

      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  async getLatestSensorDatabyLocation(hours) {
    const cacheKey = `latest_data_by_location:${hours}:all}`;

    let query = `
      SELECT iot_devices.equipment_id, iot_devices.longitude, iot_devices.latitude, AVG(sensor_data.value) AS value
      FROM sensor_data
      JOIN iot_devices ON sensor_data.equipment_id = iot_devices.equipment_id
      WHERE sensor_data.timestamp >= NOW() - INTERVAL '${hours} hours'
      GROUP BY iot_devices.equipment_id, iot_devices.longitude, iot_devices.latitude;
    `;
    
    const values = [];
    try {
      const result = await db.query(query, values);
      await redis.set(cacheKey, JSON.stringify(result.rows), 'EX', CACHE_TTL);

      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  async batchInsert(data) {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      for (const item of data) {
        await client.query(
          'INSERT INTO sensor_data (equipment_id, timestamp, value) VALUES ($1, $2, $3)',
          [item.equipmentId, item.timestamp, item.value]
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error batch inserting sensor data', { error });
      throw error;
    } finally {
      client.release();
    }
  }
};

module.exports = SensorData;