import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/app';

const app = createApp();

export default function handler(req: VercelRequest, res: VercelResponse) {
  // @vercel/node gives us a Node IncomingMessage + ServerResponse pair.
  // Express just needs the raw req/res forwarded in.
  (app as any)(req, res);
}
