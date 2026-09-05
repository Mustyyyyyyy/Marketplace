import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../backend/src/app';

const app = createApp();

export default function handler(req: VercelRequest, res: VercelResponse) {
  app(req, res);
}
