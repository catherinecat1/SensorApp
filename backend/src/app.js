const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const sensorDataRoutes = require('./routes/sensorData');
const iotDeviceRoutes = require('./routes/iotDevices.js');
const healthRoutes = require('./routes/health');
const rateLimiter = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(rateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', sensorDataRoutes);
app.use('/api/iot-devices', iotDeviceRoutes);
app.use('/health', healthRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err });
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;

function startServer() {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

startServer();

module.exports = app;