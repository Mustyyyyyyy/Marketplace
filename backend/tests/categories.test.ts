import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/db';

const app = createApp();
const unique = () => Date.now() + Math.floor(Math.random() * 1000);

async function loginAs(email: string) {
  const r = await request(app).post('/api/auth/login').send({ email, password: 'Admin123!ChangeMe' });
  return r.body.accessToken as string;
}

describe('Categories', () => {
  afterAll(async () => { await prisma.$disconnect(); });

  test('list includes seeded categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.categories.length).toBeGreaterThan(5);
  });

  test('admin can create and soft-delete', async () => {
    const token = await loginAs('admin@marketplace.local');
    const slug = `cat-${unique()}`;
    const created = await request(app).post('/api/categories').set('Authorization', `Bearer ${token}`).send({ name: 'Test', slug });
    expect(created.status).toBe(201);
    const del = await request(app).delete(`/api/categories/${created.body.id}`).set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(200);
  });

  test('non-admin cannot create', async () => {
    const email = `c${unique()}@example.com`;
    await request(app).post('/api/auth/register').send({ email, password: 'Sup3rSecret!' });
    const login = await request(app).post('/api/auth/login').send({ email, password: 'Sup3rSecret!' });
    const r = await request(app).post('/api/categories').set('Authorization', `Bearer ${login.body.accessToken}`).send({ name: 'X', slug: `x-${unique()}` });
    expect(r.status).toBe(403);
  });
});