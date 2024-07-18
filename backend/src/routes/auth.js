const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const logger = require('../utils/logger');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // In a real app, we'd fetch the user from the database
    // and compare the hashed password
    if (username === 'admin' && password === 'password') {
      const user = { username: username };
      const accessToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '24h' });
      res.json({ accessToken: accessToken });
    } else {
      res.status(401).send('Username or password incorrect');
    }
  } catch (error) {
    logger.error('Error in login', { error, username });
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.json({ message: 'Token is valid', user: decoded });
  });
});

module.exports = router;