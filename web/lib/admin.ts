// Admin API client. Mirrors the backend's /api/admin/* routes.
// All requests go through the same /api/backend/* rewrite that the user
// dashboard uses, so URLs are environment-agnostic.

import { authHeader, getAccessToken, getCachedUser, setTokens, clearAuth } from './auth';

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: 'CUSTOMER' | 'TASKER' | 'ADMIN' | 'SUPPORT';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' | 'BANNED';
  emailVerified: boolean;
  phoneVerified: boolean;
  country: string;
  currency: string;
  kycStatus: 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  kycCountry: string | null;
  riskScore: number;
  avatarUrl: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  updatedAt: string;
}

export interface AdminContext {
  user: { id: string; email: string; displayName: string | null; role: string; avatarUrl: string | null; country: string };
  capabilities: string[];
}

const API = '/api/backend/api/admin';

async function req<T>(method: string, path: string, body?: any, qs?: Record<string, any>): Promise<T> {
  let url = `${API}${path}`;
  if (qs) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(qs)) {
      if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
    }
    const s = params.toString();
    if (s) url += `?${s}`;
  }
  const r = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (r.status === 401) { clearAuth(); throw new Error('Unauthorized'); }
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(j.error || `HTTP ${r.status}`);
  }
  return r.json();
}

export const adminApi = {
  me: () => req<AdminContext>('GET', '/me'),

  users: (filters?: any) => req<{ items: AdminUser[]; total: number; page: number; pageSize: number; pages: number }>('GET', '/users', undefined, filters),
  user: (id: string) => req<{ user: any }>('GET', `/users/${id}`),
  setUserStatus: (id: string, status: string, reason?: string) => req<AdminUser>('POST', `/users/${id}/status`, { status, reason }),
  setUserRole: (id: string, role: string) => req<AdminUser>('POST', `/users/${id}/role`, { role }),
  setUserKyc: (id: string, status: string, reason?: string) => req<AdminUser>('POST', `/users/${id}/kyc-override`, { status, reason }),
  impersonate: (id: string) => req<{ accessToken: string; user: any }>('POST', `/users/${id}/impersonate`),
  listNotes: (id: string) => req<{ notes: any[] }>('GET', `/users/${id}/notes`),
  addNote: (id: string, body: string) => req<any>('POST', `/users/${id}/notes`, { body }),

  kycSubmissions: (filters?: any) => req<any>('GET', '/kyc/submissions', undefined, filters),
  reviewKyc: (id: string, action: 'approve' | 'reject', reason?: string) => req<any>('POST', `/kyc/submissions/${id}/review`, { action, reason }),
  kycFunnel: () => req<any>('GET', '/kyc/funnel'),

  tasks: (filters?: any) => req<any>('GET', '/tasks', undefined, filters),
  task: (id: string) => req<{ task: any }>('GET', `/tasks/${id}`),
  cancelTask: (id: string, reason: string) => req<any>('POST', `/tasks/${id}/cancel`, { reason }),
  completeTask: (id: string) => req<any>('POST', `/tasks/${id}/complete`),

  disputes: (filters?: any) => req<any>('GET', '/disputes', undefined, filters),
  dispute: (id: string) => req<{ dispute: any }>('GET', `/disputes/${id}`),
  resolveDispute: (id: string, resolution: string, notes: string) => req<any>('POST', `/disputes/${id}/resolve`, { resolution, notes }),

  reports: (page = 1) => req<any>('GET', '/reports', undefined, { page }),
  actionReport: (id: string, action: string) => req<any>('POST', `/reports/${id}/action`, { action }),
  messageReports: (page = 1) => req<any>('GET', '/message-reports', undefined, { page }),
  actionMessageReport: (id: string, action: string) => req<any>('POST', `/message-reports/${id}/action`, { action }),
  flaggedReviews: (page = 1) => req<any>('GET', '/reviews/flagged', undefined, { page }),
  moderateReview: (id: string, action: 'approve' | 'remove') => req<any>('POST', `/reviews/${id}/moderate`, { action }),

  categories: () => req<{ categories: any[] }>('GET', '/categories'),
  createCategory: (data: any) => req<any>('POST', '/categories', data),
  updateCategory: (id: string, data: any) => req<any>('PATCH', `/categories/${id}`, data),
  deleteCategory: (id: string) => req<any>('DELETE', `/categories/${id}`),

  broadcasts: (filters?: any) => req<any>('GET', '/broadcasts', undefined, filters),
  createBroadcast: (data: any) => req<any>('POST', '/broadcasts', data),
  sendBroadcast: (id: string) => req<any>('POST', `/broadcasts/${id}/send`),

  analyticsOverview: () => req<any>('GET', '/analytics/overview'),
  signupSeries: (days = 30) => req<{ days: any[] }>('GET', '/analytics/signups', undefined, { days }),
  taskSeries: (days = 30) => req<{ days: any[] }>('GET', '/analytics/tasks', undefined, { days }),

  riskEvents: (filters?: any) => req<any>('GET', '/risk/events', undefined, filters),
  highRiskUsers: () => req<{ users: any[] }>('GET', '/risk/users'),

  auditLogs: (filters?: any) => req<any>('GET', '/audit-logs', undefined, filters),

  getSettings: () => req<any>('GET', '/settings'),
  updateSettings: (data: any) => req<any>('PATCH', '/settings', data),

  admins: () => req<{ admins: any[] }>('GET', '/admins'),
  removeAdmin: (id: string) => req<any>('POST', `/admins/${id}/remove`),
  invites: () => req<{ invites: any[] }>('GET', '/invites'),
  createInvite: (data: any) => req<any>('POST', '/invites', data),
  revokeInvite: (id: string) => req<any>('POST', `/invites/${id}/revoke`),
  getAdminPermissions: (id: string) => req<any>('GET', `/admins/${id}/permissions`),
  setAdminPermissions: (id: string, allow: string[], deny: string[]) => req<any>('PUT', `/admins/${id}/permissions`, { allow, deny }),
};
