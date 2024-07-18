const IoTDevice = require('../models/iotDevice');

const authenticateIoTDevice = async (req, res, next) => {
  const { equipmentId } = req.body;
  const secretKey = req.headers['x-secret-key'];

  if (!equipmentId || !secretKey) {
    return res.status(401).json({ error: 'Equipment ID and Secret Key are required' });
  }

  try {
    const isVerified = await IoTDevice.verify(equipmentId, secretKey);
    if (!isVerified) {
      return res.status(403).json({ error: 'Invalid Equipment ID or Secret Key' });
    }
    req.equipmentId = equipmentId;
    next();
  } catch (error) {
    console.error('Error verifying IoT device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = authenticateIoTDevice;