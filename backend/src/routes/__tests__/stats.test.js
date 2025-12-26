const request = require('supertest');
const express = require('express');
const statsRouter = require('../stats');

// Helper to create an app instance with the stats router mounted
const createApp = () => {
  const app = express();
  app.use('/api/stats', statsRouter);
  return app;
};

// Basic smoke tests for /api/stats
describe('/api/stats', () => {
  test('should return stats with total and averagePrice', async () => {
    const app = createApp();
    const res = await request(app).get('/api/stats');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('averagePrice');
  });

  test('should serve cached stats without error on subsequent calls', async () => {
    const app = createApp();

    const first = await request(app).get('/api/stats');
    const second = await request(app).get('/api/stats');

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(second.body).toEqual(first.body);
  });
});
