const request = require('supertest');
const express = require('express');
const itemsRouter = require('../items');

// Helper to create an app instance with the items router mounted
const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/items', itemsRouter);
  return app;
};

// Note: These tests exercise the real file-based implementation.
// For a larger project, you'd typically mock fs to avoid touching disk.

describe('/api/items', () => {
  test('GET /api/items returns paginated items with metadata (happy path)', async () => {
    const app = createApp();

    const res = await request(app).get('/api/items?page=1&pageSize=5');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination).toMatchObject({
      page: 1,
      pageSize: 5,
    });
  });

  test('GET /api/items supports search query', async () => {
    const app = createApp();

    const res = await request(app).get('/api/items?q=item');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(res.body).toHaveProperty('pagination');
  });

  test('GET /api/items/:id returns item when found (happy path)', async () => {
    const app = createApp();

    // First, get the list to find a valid ID
    const listRes = await request(app).get('/api/items?page=1&pageSize=1');
    expect(listRes.status).toBe(200);
    const firstItem = listRes.body.items[0];
    expect(firstItem).toBeDefined();

    const res = await request(app).get(`/api/items/${firstItem.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: firstItem.id });
  });

  test('GET /api/items/:id returns 404 when item not found', async () => {
    const app = createApp();

    const res = await request(app).get('/api/items/99999999');

    expect(res.status).toBe(404);
  });

  test('POST /api/items creates a new item (happy path)', async () => {
    const app = createApp();

    const newItem = { name: 'Test Item', category: 'Test', price: 9.99 };

    const res = await request(app)
      .post('/api/items')
      .send(newItem)
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(newItem.name);
  });
});
