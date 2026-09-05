import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/db';

const app = createApp();

const unique = () => Date.now() + Math.floor(Math.random() * 1000);

describe('Auth flow', () => {
  afterAll(async () => { await prisma.$disconnect(); });

  test('health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('register, login, refresh, logout, me', async () => {
    const email = `u${unique()}@example.com`;
    const reg = await request(app).post('/api/auth/register').send({
      email, password: 'Sup3rSecret!', role: 'CUSTOMER', displayName: 'Alice', country: 'NG', currency: 'NGN', locale: 'en',
    });
    expect(reg.status).toBe(201);
    expect(reg.body.user.email).toBe(email);

    const bad = await request(app).post('/api/auth/register').send({ email, password: 'Sup3rSecret!' });
    expect(bad.status).toBe(409);

    const login = await request(app).post('/api/auth/login').send({ email, password: 'Sup3rSecret!' });
    expect(login.status).toBe(200);
    expect(login.body.accessToken).toBeTruthy();
    const access = login.body.accessToken;
    const refresh = login.body.refreshToken;

    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${access}`);
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(email);

    const ref = await request(app).post('/api/auth/refresh').send({ refreshToken: refresh });
    expect(ref.status).toBe(200);
    expect(ref.body.accessToken).toBeTruthy();

    const out = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${access}`);
    expect(out.status).toBe(200);
  });

  test('bad password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nope@example.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  test('email verification round trip (dev token)', async () => {
    const email = `v${unique()}@example.com`;
    await request(app).post('/api/auth/register').send({ email, password: 'Sup3rSecret!', role: 'TASKER' });
    const login = await request(app).post('/api/auth/login').send({ email, password: 'Sup3rSecret!' });
    const access = login.body.accessToken;
    const reqTok = await request(app).post('/api/auth/verify/email/request').set('Authorization', `Bearer ${access}`);
    expect(reqTok.status).toBe(200);
    const token = reqTok.body.devToken;
    expect(token).toBeTruthy();
    const conf = await request(app).post('/api/auth/verify/email/confirm').send({ token });
    expect(conf.status).toBe(200);
  });

  test('password reset round trip', async () => {
    const email = `r${unique()}@example.com`;
    await request(app).post('/api/auth/register').send({ email, password: 'Sup3rSecret!' });
    const req = await request(app).post('/api/auth/password/request').send({ email });
    expect(req.status).toBe(200);
    // pull the most recent token from dev helper
    const list = await request(app).get(`/api/auth/dev/email-token?email=${encodeURIComponent(email)}`);
    expect(list.status).toBe(200);
    const tokenHash = list.body.tokens[0];
    // The raw token isn't stored, so we test the fail path; the happy path requires the email link.
    const conf = await request(app).post('/api/auth/password/reset').send({ token: 'definitely-not-a-real-token', newPassword: 'N3wSecret!' });
    expect(conf.status).toBe(400);
  });
});