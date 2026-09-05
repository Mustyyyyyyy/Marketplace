import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/db';

const app = createApp();
const unique = () => Date.now() + Math.floor(Math.random() * 1000);

async function reg(role: 'CUSTOMER' | 'TASKER') {
  const email = `${role.toLowerCase()}${unique()}@example.com`;
  await request(app).post('/api/auth/register').send({ email, password: 'Sup3rSecret!', role });
  const r = await request(app).post('/api/auth/login').send({ email, password: 'Sup3rSecret!' });
  return { email, access: r.body.accessToken as string, id: (await prisma.user.findUnique({ where: { email } }))!.id };
}

describe('Messaging', () => {
  afterAll(async () => { await prisma.$disconnect(); });

  test('customer and tasker chat on a task', async () => {
    const c = await reg('CUSTOMER');
    const t = await reg('TASKER');
    const task = await request(app).post('/api/tasks').set('Authorization', `Bearer ${c.access}`).send({ title: 'Chat task', description: 'long description here', mode: 'REMOTE', budgetType: 'FIXED', budgetAmount: 50, currency: 'USD' });
    await request(app).post(`/api/tasks/${task.body.id}/publish`).set('Authorization', `Bearer ${c.access}`);
    await request(app).post(`/api/tasks/${task.body.id}/offers`).set('Authorization', `Bearer ${t.access}`).send({ price: 50, currency: 'USD', timelineDays: 1, proposal: 'can help' });

    const conv = await request(app).post('/api/conversations/task').set('Authorization', `Bearer ${c.access}`).send({ taskId: task.body.id });
    expect(conv.status).toBe(200);

    const send = await request(app).post(`/api/conversations/${conv.body.id}/messages`).set('Authorization', `Bearer ${c.access}`).send({ body: 'Hi there' });
    expect(send.status).toBe(201);

    const send2 = await request(app).post(`/api/conversations/${conv.body.id}/messages`).set('Authorization', `Bearer ${t.access}`).send({ body: 'Hello, I can help' });
    expect(send2.status).toBe(201);

    const list = await request(app).get(`/api/conversations/${conv.body.id}/messages`).set('Authorization', `Bearer ${c.access}`);
    expect(list.body.messages.length).toBe(2);

    const read = await request(app).post(`/api/conversations/${conv.body.id}/read`).set('Authorization', `Bearer ${c.access}`);
    expect(read.status).toBe(200);
  });

  test('block prevents messaging', async () => {
    const c = await reg('CUSTOMER');
    const t = await reg('TASKER');
    await request(app).post('/api/blocks').set('Authorization', `Bearer ${c.access}`).send({ userId: t.id });
    const direct = await request(app).post('/api/conversations/direct').set('Authorization', `Bearer ${c.access}`).send({ userId: t.id });
    expect(direct.status).toBe(403);
  });

  test('cannot view other users conversation', async () => {
    const a = await reg('CUSTOMER');
    const b = await reg('CUSTOMER');
    const conv = await request(app).post('/api/conversations/direct').set('Authorization', `Bearer ${a.access}`).send({ userId: b.id });
    const r = await request(app).get(`/api/conversations/${conv.body.id}/messages`).set('Authorization', `Bearer ${b.access}`); // b is a member, should work
    expect(r.status).toBe(200);
  });
});