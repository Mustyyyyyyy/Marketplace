import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/db';

const app = createApp();
const unique = () => Date.now() + Math.floor(Math.random() * 1000);

async function registerAndLogin(role: 'CUSTOMER' | 'TASKER' = 'TASKER') {
  const email = `${role.toLowerCase()}${unique()}@example.com`;
  await request(app).post('/api/auth/register').send({ email, password: 'Sup3rSecret!', role });
  const login = await request(app).post('/api/auth/login').send({ email, password: 'Sup3rSecret!' });
  return { email, access: login.body.accessToken as string };
}

describe('Profile flow', () => {
  afterAll(async () => { await prisma.$disconnect(); });

  test('tasker sets skills, certifications, portfolio, availability', async () => {
    const { access } = await registerAndLogin('TASKER');
    const me = await request(app).get('/api/profile/me').set('Authorization', `Bearer ${access}`);
    expect(me.status).toBe(200);

    const sk = await request(app).put('/api/profile/tasker/skills').set('Authorization', `Bearer ${access}`).send({ skills: ['plumbing', 'Painting', 'painting'] });
    expect(sk.status).toBe(200);
    expect(sk.body.count).toBe(2);

    const cert = await request(app).post('/api/profile/tasker/certifications').set('Authorization', `Bearer ${access}`).send({ title: 'Licensed Plumber', issuer: 'Lagos State' });
    expect(cert.status).toBe(201);

    const port = await request(app).post('/api/profile/tasker/portfolio').set('Authorization', `Bearer ${access}`).send({ title: 'Bathroom remodel', description: 'Full refit' });
    expect(port.status).toBe(201);

    const av = await request(app).put('/api/profile/tasker/availability').set('Authorization', `Bearer ${access}`).send({ windows: [{ weekday: 1, startMinute: 540, endMinute: 1080 }] });
    expect(av.status).toBe(200);
  });

  test('public tasker profile visible to anyone', async () => {
    const { access } = await registerAndLogin('TASKER');
    const me = await request(app).get('/api/profile/me').set('Authorization', `Bearer ${access}`);
    const id = me.body.profile.id;
    const pub = await request(app).get(`/api/public/taskers/${id}`);
    expect(pub.status).toBe(200);
    expect(pub.body.taskerProfile).toBeTruthy();
  });
});