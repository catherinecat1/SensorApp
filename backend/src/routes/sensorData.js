const express = require('express');
const router = express.Router();
const SensorData = require('../models/sensorData');
const IoTDevice = require('../models/iotDevice');
const authenticateIoTDevice = require('../middleware/iotAuth');
const logger = require('../utils/logger');
const authenticateToken = require('../middleware/auth');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });


router.post('/sensor-data', authenticateIoTDevice, async (req, res) => {
  const { equipmentId, timestamp, value } = req.body;

  try {
    await SensorData.insert(equipmentId, timestamp, value);
    res.status(201).json({ message: 'Data received and stored successfully' });
  } catch (error) {
    logger.error('Error storing sensor data', { error, equipmentId, timestamp, value });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/average-sensor-data', authenticateToken,  async (req, res) => {
  const { period, equipmentId } = req.query;

  try {
    const data = await SensorData.getAverageData(period, equipmentId);
    res.json(data);
  } catch (error) {
    console.error('Error fetching average sensor data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/equipment-data', authenticateToken,  async (req, res) => {
  const { equipmentId, startDate, endDate } = req.query;

  try {
    const data = await SensorData.getDataByEquipment(equipmentId, startDate, endDate);
    const deviceInfo = await IoTDevice.getById(equipmentId);
    
    res.json({
      equipmentInfo: deviceInfo,
      sensorData: data
    });
  } catch (error) {
    logger.error('Error fetching equipment data', { error, equipmentId, startDate, endDate });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/ingest-csv', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        logger.info(`Processing ${results.length} rows from CSV`);
        
        for (const row of results) {
          await SensorData.insert(row.equipmentId, row.timestamp, parseFloat(row.value));
        }

        fs.unlinkSync(req.file.path);

        res.status(201).json({ message: 'CSV data ingested successfully', rowCount: results.length });
      } catch (error) {
        logger.error('Error ingesting CSV data:', error);
        fs.unlinkSync(req.file.path);
        res.status(500).json({ error: 'Internal server error', details: error.message });
      }
    });
});

router.get('/latest-sensor-data', authenticateToken, async (req, res) => {
  const { hours, equipmentId } = req.query;
  
  try {
    const data = await SensorData.getLatestSensorData(hours, equipmentId);
    res.json(data);
  } catch (error) {
    console.error('Error fetching latest sensor data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/latest-sensor-data-by-location', authenticateToken, async (req, res) => {
  const { hours} = req.query;
  
  try {
    const data = await SensorData.getLatestSensorDatabyLocation(hours);
    res.json(data);
  } catch (error) {
    console.error('Error fetching latest sensor data by Location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;