const request = require('supertest');
const app = require('../../src/app');
const jwt = require('jsonwebtoken');

describe('Sensor Data Routes', () => {
  let token;

  beforeAll(() => {
    token = jwt.sign({ username: 'testuser' }, process.env.JWT_SECRET);
  });

  it('should return average sensor data when authenticated', async () => {
    const response = await request(app)
      .get('/api/average-sensor-data?period=24')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  it('should return 401 when not authenticated', async () => {
    const response = await request(app)
      .post('/api/sensor-data')
      .send({ equipmentId: 'EQ001', timestamp: '2023-07-12T12:00:00Z', value: 75.5 });

    expect(response.statusCode).toBe(401);
  });
});