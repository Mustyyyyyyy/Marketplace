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

async function fullFlowToReview(custToken: string, taskerToken: string) {
  const t = await request(app).post('/api/tasks').set('Authorization', `Bearer ${custToken}`).send({ title: 'Review task', description: 'long enough description', mode: 'REMOTE', budgetType: 'FIXED', budgetAmount: 100, currency: 'USD' });
  await request(app).post(`/api/tasks/${t.body.id}/publish`).set('Authorization', `Bearer ${custToken}`);
  const offer = await request(app).post(`/api/tasks/${t.body.id}/offers`).set('Authorization', `Bearer ${taskerToken}`).send({ price: 90, currency: 'USD', timelineDays: 1, proposal: 'happy to help' });
  await request(app).post(`/api/offers/${offer.body.id}/accept`).set('Authorization', `Bearer ${custToken}`);
  await request(app).post(`/api/tasks/${t.body.id}/start`).set('Authorization', `Bearer ${taskerToken}`);
  await request(app).post(`/api/tasks/${t.body.id}/submit`).set('Authorization', `Bearer ${taskerToken}`).send({ evidence: 'All done' });
  await request(app).post(`/api/tasks/${t.body.id}/confirm`).set('Authorization', `Bearer ${custToken}`);
  return t.body.id as string;
}

describe('Notifications + Reviews', () => {
  afterAll(async () => { await prisma.$disconnect(); });

  test('user can manage notification preferences', async () => {
    const c = await reg('CUSTOMER');
    const r = await request(app).get('/api/notifications').set('Authorization', `Bearer ${c.access}`);
    expect(r.status).toBe(200);
    const pref = await request(app).put('/api/notifications/preferences').set('Authorization', `Bearer ${c.access}`).send({ type: 'NEW_OFFER', email: false, sms: true });
    expect(pref.status).toBe(200);
    expect(pref.body.sms).toBe(true);
  });

  test('customer reviews tasker; task becomes COMPLETED; ratings update', async () => {
    const c = await reg('CUSTOMER');
    const t = await reg('TASKER');
    const taskId = await fullFlowToReview(c.access, t.access);
    const review = await request(app).post(`/api/tasks/${taskId}/review`).set('Authorization', `Bearer ${c.access}`).send({ rating: 5, body: 'Excellent work!' });
    expect(review.status).toBe(201);

    const tp = await prisma.taskerProfile.findUnique({ where: { userId: t.id } });
    expect(tp?.ratingAvg).toBe(5);
    expect(tp?.ratingCount).toBe(1);

    const final = await prisma.task.findUnique({ where: { id: taskId } });
    expect(final?.status).toBe('COMPLETED');
  });

  test('cannot review when not a participant', async () => {
    const c = await reg('CUSTOMER');
    const t = await reg('TASKER');
    const taskId = await fullFlowToReview(c.access, t.access);
    const intruder = await reg('CUSTOMER');
    const r = await request(app).post(`/api/tasks/${taskId}/review`).set('Authorization', `Bearer ${intruder.access}`).send({ rating: 4, body: 'should not work' });
    expect(r.status).toBe(403);
  });

  test('tasker reviews customer', async () => {
    const c = await reg('CUSTOMER');
    const t = await reg('TASKER');
    const taskId = await fullFlowToReview(c.access, t.access);
    const review = await request(app).post(`/api/tasks/${taskId}/review`).set('Authorization', `Bearer ${t.access}`).send({ rating: 4, body: 'Great customer' });
    expect(review.status).toBe(201);
  });
});