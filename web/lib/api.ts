// Server-side API helper used during SSR. Routes via the Next.js rewrite to the backend.
const BASE =
  process.env.BACKEND_INTERNAL_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:4000');

export async function api<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { ...init, cache: 'no-store' });
  if (!res.ok) throw new Error(`Backend ${res.status} on ${path}`);
  return res.json();
}
