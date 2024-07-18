const express = require('express');
const router = express.Router();
const IoTDevice = require('../models/iotDevice');
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, async (req, res) => {
  const { equipmentId, secretKey, longitude, latitude } = req.body;
  try {
    const device = await IoTDevice.create(equipmentId, secretKey, longitude, latitude);
    res.status(201).json({ message: 'IoT device created successfully', equipmentId: device.equipment_id });
  } catch (error) {
    console.error('Error creating IoT device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const devices = await IoTDevice.getAll();
    res.json(devices);
  } catch (error) {
    console.error('Error fetching IoT devices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;