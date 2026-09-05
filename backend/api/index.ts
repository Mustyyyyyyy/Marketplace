// Vercel serverless wrapper for the Express API.
//
// Caveats:
// - Socket.IO is NOT supported on Vercel serverless. The real-time chat
//   continues to work in self-hosted deployments, but on Vercel the mobile
//   and web clients fall back to polling the conversation's messages.
// - The Prisma client and the cloudinary SDK are initialised lazily per
//   cold start.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/app';

let app: ReturnType<typeof createApp> | null = null;

function getApp() {
  if (!app) app = createApp();
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Strip the /api/backend prefix so the Express app sees the path it expects.
  const url = req.url || '/';
  const stripped = url.replace(/^\/api\/backend/, '') || '/';
  const nextReq = Object.assign({}, req, { url: stripped }) as VercelRequest;

  const expressApp = getApp();
  // Express is (req, res) callback-based; wrap it as a promise.
  await new Promise<void>((resolve) => {
    expressApp(nextReq as any, res as any, () => resolve());
  });
}
