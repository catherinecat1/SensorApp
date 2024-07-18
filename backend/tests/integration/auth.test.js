const request = require('supertest');
const app = require('../../src/app');

describe('Auth Routes', () => {
  it('should return a token when correct credentials are provided', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'password' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
  });

  it('should return 401 when incorrect credentials are provided', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrongpassword' });

    expect(response.statusCode).toBe(401);
    expect(response.text).toBe('Username or password incorrect');
  });
});