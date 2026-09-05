import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/db';

const app = createApp();
const unique = () => Date.now() + Math.floor(Math.random() * 1000);

async function reg(role: 'CUSTOMER' | 'TASKER') {
  const email = `${role.toLowerCase()}${unique()}@example.com`;
  await request(app).post('/api/auth/register').send({ email, password: 'Sup3rSecret!', role });
  const r = await request(app).post('/api/auth/login').send({ email, password: 'Sup3rSecret!' });
  return { email, access: r.body.accessToken as string };
}

async function publishedTask(customerToken: string) {
  const t = await request(app).post('/api/tasks').set('Authorization', `Bearer ${customerToken}`).send({
    title: 'Need help', description: 'long enough description here', mode: 'REMOTE', budgetType: 'FIXED', budgetAmount: 200, currency: 'USD',
  });
  await request(app).post(`/api/tasks/${t.body.id}/publish`).set('Authorization', `Bearer ${customerToken}`);
  return t.body.id as string;
}

describe('Offers & hiring lifecycle', () => {
  afterAll(async () => { await prisma.$disconnect(); });

  test('tasker offers, customer accepts, task moves through states', async () => {
    const c = await reg('CUSTOMER');
    const t = await reg('TASKER');
    const taskId = await publishedTask(c.access);

    const offer = await request(app).post(`/api/tasks/${taskId}/offers`).set('Authorization', `Bearer ${t.access}`).send({ price: 180, currency: 'USD', timelineDays: 2, proposal: 'I can help with this task quickly' });
    expect(offer.status).toBe(201);
    expect(offer.body.status).toBe('PENDING');

    // second offer
    const t2 = await reg('TASKER');
    await request(app).post(`/api/tasks/${taskId}/offers`).set('Authorization', `Bearer ${t2.access}`).send({ price: 220, currency: 'USD', timelineDays: 3, proposal: 'experienced tasker here' });

    const list = await request(app).get(`/api/tasks/${taskId}/offers`).set('Authorization', `Bearer ${c.access}`);
    expect(list.body.offers.length).toBe(2);

    const accept = await request(app).post(`/api/offers/${offer.body.id}/accept`).set('Authorization', `Bearer ${c.access}`);
    expect(accept.status).toBe(200);
    expect(accept.body.task.status).toBe('OFFER_SELECTED');
    expect(accept.body.hire.taskerId).toBe(t.email ? (await prisma.user.findUnique({ where: { email: t.email } }))!.id : '');

    // start work
    const start = await request(app).post(`/api/tasks/${taskId}/start`).set('Authorization', `Bearer ${t.access}`);
    expect(start.status).toBe(200);
    const taskAfter = await prisma.task.findUnique({ where: { id: taskId } });
    expect(taskAfter?.status).toBe('IN_PROGRESS');

    // submit
    const sub = await request(app).post(`/api/tasks/${taskId}/submit`).set('Authorization', `Bearer ${t.access}`).send({ evidence: 'Done, here is the file' });
    expect(sub.status).toBe(200);

    // confirm
    const conf = await request(app).post(`/api/tasks/${taskId}/confirm`).set('Authorization', `Bearer ${c.access}`);
    expect(conf.status).toBe(200);
    const final = await prisma.task.findUnique({ where: { id: taskId } });
    expect(final?.status).toBe('CUSTOMER_REVIEW');
  });

  test('cannot offer on own task', async () => {
    const c = await reg('CUSTOMER');
    const t = await publishedTask(c.access);
    const r = await request(app).post(`/api/tasks/${t}/offers`).set('Authorization', `Bearer ${c.access}`).send({ price: 100, currency: 'USD', timelineDays: 1, proposal: 'self offer' });
    expect(r.status).toBe(400);
  });

  test('cannot offer twice', async () => {
    const c = await reg('CUSTOMER');
    const tk = await reg('TASKER');
    const taskId = await publishedTask(c.access);
    await request(app).post(`/api/tasks/${taskId}/offers`).set('Authorization', `Bearer ${tk.access}`).send({ price: 50, currency: 'USD', timelineDays: 1, proposal: 'first offer' });
    const r = await request(app).post(`/api/tasks/${taskId}/offers`).set('Authorization', `Bearer ${tk.access}`).send({ price: 60, currency: 'USD', timelineDays: 1, proposal: 'second offer' });
    expect(r.status).toBe(409);
  });
});