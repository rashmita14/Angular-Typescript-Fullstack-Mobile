import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import { createApp } from './app.js';

const app = createApp();

test('health reports the database readiness state', async () => {
  const response = await request(app).get('/api/health');

  assert.equal(response.status, 503);
  assert.deepEqual(response.body, { status: 'unavailable', database: 'disconnected' });
});

test('rejects task requests with invalid identifiers before database access', async () => {
  const response = await request(app).delete('/api/tasks/not-an-object-id');

  assert.equal(response.status, 400);
  assert.match(response.body.error, /valid MongoDB ObjectId/);
});

test('validates create bodies and rejects unexpected task properties', async () => {
  const response = await request(app)
    .post('/api/tasks')
    .send({ title: 'Read the guide', admin: true });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, 'Invalid request');
});

test('returns a JSON 404 for unknown routes', async () => {
  const response = await request(app).get('/api/unknown');

  assert.equal(response.status, 404);
  assert.match(response.body.error, /Route not found/);
});

test('blocks requests from origins outside the configured allowlist', async () => {
  const response = await request(app)
    .get('/api/health')
    .set('Origin', 'https://untrusted.example');

  assert.equal(response.status, 403);
  assert.deepEqual(response.body, { error: 'Origin not allowed' });
});
