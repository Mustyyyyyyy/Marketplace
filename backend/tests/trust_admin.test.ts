import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/db';

const app = createApp();
const unique = () => Date.now() + Math.floor(Math.random() * 1000);

async function reg(role: 'CUSTOMER' | 'TASKER' | 'ADMIN' | 'SUPPORT' = 'CUSTOMER') {
  const email = `${role.toLowerCase()}${unique()}@example.com`;
  await request(app).post('/api/auth/register').send({ email, password: 'Sup3rSecret!', role });
  const r = await request(app).post('/api/auth/login').send({ email, password: 'Sup3rSecret!' });
  return { email, access: r.body.accessToken as string, id: (await prisma.user.findUnique({ where: { email } }))!.id };
}

async function loginAs(email: string) {
  const password = email === 'admin@marketplace.local' ? 'Admin123!ChangeMe' : 'Sup3rSecret!';
  const r = await request(app).post('/api/auth/login').send({ email, password });
  return r.body.accessToken as string;
}

async function fullFlowToReview(custToken: string, taskerToken: string) {
  const t = await request(app).post('/api/tasks').set('Authorization', `Bearer ${custToken}`).send({ title: 'Dispute task', description: 'long enough description', mode: 'REMOTE', budgetType: 'FIXED', budgetAmount: 100, currency: 'USD' });
  await request(app).post(`/api/tasks/${t.body.id}/publish`).set('Authorization', `Bearer ${custToken}`);
  const offer = await request(app).post(`/api/tasks/${t.body.id}/offers`).set('Authorization', `Bearer ${taskerToken}`).send({ price: 90, currency: 'USD', timelineDays: 1, proposal: 'happy to help' });
  await request(app).post(`/api/offers/${offer.body.id}/accept`).set('Authorization', `Bearer ${custToken}`);
  await request(app).post(`/api/tasks/${t.body.id}/start`).set('Authorization', `Bearer ${taskerToken}`);
  await request(app).post(`/api/tasks/${t.body.id}/submit`).set('Authorization', `Bearer ${taskerToken}`).send({ evidence: 'Done' });
  return t.body.id as string;
}

describe('Trust, safety, disputes, admin', () => {
  afterAll(async () => { await prisma.$disconnect(); });

  test('customer files a report', async () => {
    const c = await reg('CUSTOMER');
    const r = await request(app).post('/api/reports').set('Authorization', `Bearer ${c.access}`).send({ targetType: 'USER', targetId: 'some_id', reason: 'spam', details: 'sending junk' });
    expect(r.status).toBe(201);
  });

  test('dispute lifecycle', async () => {
    const c = await reg('CUSTOMER');
    const t = await reg('TASKER');
    const taskId = await fullFlowToReview(c.access, t.access);
    const d = await request(app).post(`/api/disputes/tasks/${taskId}`).set('Authorization', `Bearer ${c.access}`).send({ reason: 'not as described', details: 'the work is incomplete' });
    expect(d.status).toBe(201);
    expect(d.body.status).toBe('OPEN');

    const adminToken = await loginAs('admin@marketplace.local');
    const list = await request(app).get('/api/disputes').set('Authorization', `Bearer ${adminToken}`);
    expect(list.body.disputes.length).toBeGreaterThan(0);

    const upd = await request(app).post(`/api/disputes/${d.body.id}/status`).set('Authorization', `Bearer ${adminToken}`).send({ status: 'RESOLVED_CUSTOMER', resolution: 'refund issued' });
    expect(upd.body.status).toBe('RESOLVED_CUSTOMER');
  });

  test('kyc submit + admin review', async () => {
    const t = await reg('TASKER');
    const sub = await request(app).post('/api/kyc/submit').set('Authorization', `Bearer ${t.access}`).send({ documentUrl: 'https://example.com/id.jpg' });
    expect(sub.body.kycStatus).toBe('PENDING');
    const adminToken = await loginAs('admin@marketplace.local');
    const rev = await request(app).post(`/api/admin/kyc/${t.id}/review`).set('Authorization', `Bearer ${adminToken}`).send({ approve: true });
    expect(rev.body.kycStatus).toBe('APPROVED');
  });

  test('admin can list users, tasks, analytics', async () => {
    const adminToken = await loginAs('admin@marketplace.local');
    const users = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${adminToken}`);
    expect(users.status).toBe(200);
    const a = await request(app).get('/api/admin/analytics').set('Authorization', `Bearer ${adminToken}`);
    expect(a.body.users).toBeGreaterThan(0);
  });

  test('non-admin cannot access admin endpoints', async () => {
    const c = await reg('CUSTOMER');
    const r = await request(app).get('/api/admin/users').set('Authorization', `Bearer ${c.access}`);
    expect(r.status).toBe(403);
  });

  test('admin can suspend a user', async () => {
    const t = await reg('TASKER');
    const adminToken = await loginAs('admin@marketplace.local');
    const s = await request(app).post(`/api/admin/users/${t.id}/status`).set('Authorization', `Bearer ${adminToken}`).send({ status: 'SUSPENDED' });
    expect(s.body.status).toBe('SUSPENDED');
    // suspended user cannot log in
    const login = await request(app).post('/api/auth/login').send({ email: t.email, password: 'Sup3rSecret!' });
    expect(login.status).toBe(403);
  });
});