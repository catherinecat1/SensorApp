require('dotenv').config();
const { Pool } = require('pg');
const faker = require('faker');
const bcrypt = require('bcrypt');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function generateDummyData() {
  try {
    const equipmentIds = new Set();

    // Generate 1000 IoT devices
    for (let i = 0; i < 1000; i++) {
      let equipmentId;
      do {
        equipmentId = `EQ-${faker.datatype.number({ min: 10000, max: 99999 })}`;
      } while (equipmentIds.has(equipmentId));

      equipmentIds.add(equipmentId);

      const secretKey = await bcrypt.hash(faker.internet.password(), 10);
      const longitude = faker.address.longitude();
      const latitude = faker.address.latitude();

      await pool.query(
        'INSERT INTO iot_devices (equipment_id, secret_key, longitude, latitude) VALUES ($1, $2, $3, $4)',
        [equipmentId, secretKey, longitude, latitude]
      );

      console.log(`Created IoT device: ${equipmentId}`);

      // Generate 2 sensor data entries for each device within the last week
      const timestamps = new Set();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      for (let j = 0; j < 2; j++) {
        let timestamp;
        do {
          timestamp = faker.date.between(oneWeekAgo, new Date()).toISOString();
        } while (timestamps.has(timestamp));

        timestamps.add(timestamp);

        const value = faker.datatype.float({ min: 0, max: 100, precision: 0.01 });

        await pool.query(
          'INSERT INTO sensor_data (equipment_id, timestamp, value) VALUES ($1, $2, $3)',
          [equipmentId, timestamp, value]
        );

        console.log(`Created sensor data for ${equipmentId}: ${value} at ${timestamp}`);
      }
    }

    console.log('Dummy data generation completed!');
  } catch (error) {
    console.error('Error generating dummy data:', error);
  } finally {
    await pool.end();
  }
}

generateDummyData();