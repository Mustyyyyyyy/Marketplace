// Integration tests against the LIVE backend. Run only when the API is up.
import { api, setTokens, loadTokens, ApiError, API_BASE } from '../src/lib/api';

const baseEmail = () => `mob${Date.now()}${Math.floor(Math.random() * 1000)}@example.com`;

async function registerAndLogin() {
  const email = baseEmail();
  await api.post('/api/auth/register', { email, password: 'Sup3rSecret!', role: 'CUSTOMER', country: 'NG', currency: 'NGN', locale: 'en' }, { auth: false });
  const r: any = await api.post('/api/auth/login', { email, password: 'Sup3rSecret!' }, { auth: false });
  setTokens(r.accessToken, r.refreshToken);
  return { email, ...r };
}

describe('Mobile API client (live backend)', () => {
  afterAll(async () => { setTokens(null, null); });

  test('API base is configured', () => {
    expect(API_BASE).toMatch(/^http/);
  });

  test('register, login, me, refresh, logout round-trip', async () => {
    const r = await registerAndLogin();
    const me = await api.get<any>('/api/auth/me');
    expect(me.user.email).toBe(r.email);
    const ref = await api.post<any>('/api/auth/refresh', { refreshToken: r.refreshToken });
    expect(ref.accessToken).toBeTruthy();
    await api.post('/api/auth/logout');
  });

  test('list categories (public)', async () => {
    const cats: any = await api.get('/api/categories');
    expect(cats.categories.length).toBeGreaterThan(0);
  });

  test('create task flow end-to-end (mobile client perspective)', async () => {
    await registerAndLogin();
    const t: any = await api.post('/api/tasks', { title: 'Mobile test task', description: 'long enough description from mobile', mode: 'REMOTE', budgetType: 'FIXED', budgetAmount: 75, currency: 'USD' });
    expect(t.status).toBe('DRAFT');
    await api.post(`/api/tasks/${t.id}/publish`);
    const list: any = await api.get('/api/tasks?q=Mobile');
    expect(list.items.length).toBeGreaterThan(0);
  });

  test('offers: tasker submits offer on a customer task', async () => {
    const c = await registerAndLogin();
    const t: any = await api.post('/api/tasks', { title: 'Full offer test', description: 'long description from mobile tests', mode: 'REMOTE', budgetType: 'FIXED', budgetAmount: 200, currency: 'USD' });
    await api.post(`/api/tasks/${t.id}/publish`);
    // register a tasker
    const email2 = `tasker${Date.now()}${Math.floor(Math.random() * 1000)}@example.com`;
    await api.post('/api/auth/register', { email: email2, password: 'Sup3rSecret!', role: 'TASKER' }, { auth: false });
    const lr: any = await api.post('/api/auth/login', { email: email2, password: 'Sup3rSecret!' }, { auth: false });
    setTokens(lr.accessToken, lr.refreshToken);
    const offer: any = await api.post(`/api/tasks/${t.id}/offers`, { price: 180, currency: 'USD', timelineDays: 2, proposal: 'happy to help from mobile' });
    expect(offer.status).toBe('PENDING');
    // customer lists offers
    setTokens(c.accessToken, c.refreshToken);
    const list: any = await api.get(`/api/tasks/${t.id}/offers`);
    expect(list.offers.length).toBe(1);
  });

  test('categories list + tasker recommendations endpoint reachable', async () => {
    await registerAndLogin();
    const cats: any = await api.get('/api/categories');
    expect(cats.categories.length).toBeGreaterThan(10);
    // recommendation endpoint may return 404 if no tasks exist, but the route should at least respond
    const r: any = await api.get('/api/tasks?pageSize=1');
    if (r.items?.[0]) {
      const rec: any = await api.get(`/api/recommendations/tasks/${r.items[0].id}/recommendations`);
      expect(Array.isArray(rec.taskers)).toBe(true);
    }
  });

  test('create conversation, send message, list', async () => {
    await registerAndLogin();
    const meA: any = await api.get('/api/auth/me');
    const userAId = meA.user.id;
    await registerAndLogin();
    const meB: any = await api.get('/api/auth/me');
    const conv: any = await api.post('/api/conversations/direct', { userId: userAId });
    expect(conv.id).toBeTruthy();
    const m: any = await api.post(`/api/conversations/${conv.id}/messages`, { body: 'hello from mobile test' });
    expect(m.body).toContain('hello');
    const list: any = await api.get(`/api/conversations/${conv.id}/messages`);
    expect(list.messages.length).toBe(1);
  });

  test('block a user, then messaging fails with 403', async () => {
    await registerAndLogin();
    const meA: any = await api.get('/api/auth/me');
    const userAId = meA.user.id;
    await registerAndLogin();
    await api.post('/api/blocks', { userId: userAId });
    let status: number | null = null;
    try { await api.post('/api/conversations/direct', { userId: userAId }); } catch (e: any) { status = e.status; }
    expect(status).toBe(403);
  });

  test('notifications list and preferences', async () => {
    await registerAndLogin();
    const list: any = await api.get('/api/notifications');
    expect(Array.isArray(list.items)).toBe(true);
    const pref: any = await api.put('/api/notifications/preferences', { type: 'NEW_OFFER', email: false, sms: true });
    expect(pref.sms).toBe(true);
  });

  test('bad credentials', async () => {
    try {
      await api.post('/api/auth/login', { email: 'nope@example.com', password: 'wrong' }, { auth: false });
      throw new Error('should have failed');
    } catch (e: any) { expect(e).toBeInstanceOf(ApiError); expect(e.status).toBe(401); }
  });
});
