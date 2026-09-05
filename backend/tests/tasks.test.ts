import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/db';

const app = createApp();
const unique = () => Date.now() + Math.floor(Math.random() * 1000);

async function reg(role: 'CUSTOMER' | 'TASKER' = 'CUSTOMER') {
  const email = `${role.toLowerCase()}${unique()}@example.com`;
  await request(app).post('/api/auth/register').send({ email, password: 'Sup3rSecret!', role });
  const r = await request(app).post('/api/auth/login').send({ email, password: 'Sup3rSecret!' });
  return { email, access: r.body.accessToken as string };
}

describe('Tasks', () => {
  afterAll(async () => { await prisma.$disconnect(); });

  test('customer creates draft, edits, publishes, lists, fetches', async () => {
    const { access } = await reg('CUSTOMER');
    const cat = await prisma.category.findFirst();
    const draft = await request(app).post('/api/tasks').set('Authorization', `Bearer ${access}`).send({
      title: 'Fix my sink', description: 'Kitchen sink is leaking under the cabinet', mode: 'LOCAL', budgetType: 'FIXED', budgetAmount: 15000, currency: 'NGN', categoryId: cat?.id, city: 'Lagos', country: 'NG', lat: 6.5, lng: 3.3, serviceRadiusKm: 10,
    });
    expect(draft.status).toBe(201);
    expect(draft.body.status).toBe('DRAFT');

    const upd = await request(app).patch(`/api/tasks/${draft.body.id}`).set('Authorization', `Bearer ${access}`).send({ title: 'Fix my kitchen sink urgently' });
    expect(upd.status).toBe(200);
    expect(upd.body.title).toMatch(/urgently/);

    const pub = await request(app).post(`/api/tasks/${draft.body.id}/publish`).set('Authorization', `Bearer ${access}`);
    expect(pub.status).toBe(200);
    expect(pub.body.status).toBe('PUBLISHED');

    const list = await request(app).get('/api/tasks?mode=LOCAL&country=NG&city=Lagos');
    expect(list.status).toBe(200);
    expect(list.body.items.length).toBeGreaterThan(0);

    const get = await request(app).get(`/api/tasks/${draft.body.id}`);
    expect(get.status).toBe(200);
    expect(get.body.id).toBe(draft.body.id);
  });

  test('non-owner cannot publish', async () => {
    const c = await reg('CUSTOMER');
    const other = await reg('CUSTOMER');
    const draft = await request(app).post('/api/tasks').set('Authorization', `Bearer ${c.access}`).send({
      title: 'X task', description: 'description that is long enough', mode: 'REMOTE', budgetType: 'FIXED', budgetAmount: 100, currency: 'USD',
    });
    const r = await request(app).post(`/api/tasks/${draft.body.id}/publish`).set('Authorization', `Bearer ${other.access}`);
    expect(r.status).toBe(403);
  });

  test('cannot publish when description too short at the schema level (rejected by validation)', async () => {
    const c = await reg('CUSTOMER');
    const draft = await request(app).post('/api/tasks').set('Authorization', `Bearer ${c.access}`).send({
      title: 'X', description: 'short', mode: 'REMOTE', budgetType: 'FIXED', budgetAmount: 100, currency: 'USD',
    });
    expect(draft.status).toBe(400);
  });

  test('cancel published task', async () => {
    const c = await reg('CUSTOMER');
    const t = await request(app).post('/api/tasks').set('Authorization', `Bearer ${c.access}`).send({ title: 'Cancel me', description: 'a description ok', mode: 'REMOTE', budgetType: 'FIXED', budgetAmount: 50, currency: 'USD' });
    await request(app).post(`/api/tasks/${t.body.id}/publish`).set('Authorization', `Bearer ${c.access}`);
    const r = await request(app).post(`/api/tasks/${t.body.id}/cancel`).set('Authorization', `Bearer ${c.access}`);
    expect(r.status).toBe(200);
    expect(r.body.status).toBe('CANCELLED');
  });

  test('cannot edit after cancellation', async () => {
    const c = await reg('CUSTOMER');
    const t = await request(app).post('/api/tasks').set('Authorization', `Bearer ${c.access}`).send({ title: 'Edit later', description: 'a description ok', mode: 'REMOTE', budgetType: 'FIXED', budgetAmount: 50, currency: 'USD' });
    await request(app).post(`/api/tasks/${t.body.id}/cancel`).set('Authorization', `Bearer ${c.access}`);
    const r = await request(app).patch(`/api/tasks/${t.body.id}`).set('Authorization', `Bearer ${c.access}`).send({ title: 'nope' });
    expect(r.status).toBe(400);
  });
});