const db = require('../config/database');
const bcrypt = require('bcrypt');

const IoTDevice = {
  async create(equipmentId, secretKey, longitude, latitude) {
    const hashedSecret = await bcrypt.hash(secretKey, 10);
    const query = 'INSERT INTO iot_devices (equipment_id, secret_key, longitude, latitude) VALUES ($1, $2, $3, $4) RETURNING *';
    const result = await db.query(query, [equipmentId, hashedSecret, longitude, latitude]);
    return result.rows[0];
  },

  async verify(equipmentId, secretKey) {
    const query = 'SELECT * FROM iot_devices WHERE equipment_id = $1';
    const result = await db.query(query, [equipmentId]);
    if (result.rows.length === 0) {
      return false;
    }
    return bcrypt.compare(secretKey, result.rows[0].secret_key);
  },

  async getAll() {
    const query = 'SELECT equipment_id, longitude, latitude FROM iot_devices';
    const result = await db.query(query);
    return result.rows;
  },

  async getById(equipmentId) {
    const query = 'SELECT equipment_id, longitude, latitude FROM iot_devices WHERE equipment_id = $1';
    const result = await db.query(query, [equipmentId]);
    return result.rows[0];
  }
};

module.exports = IoTDevice;