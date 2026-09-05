import { createApp } from './app';
import { env } from './config';
import { logger } from './logger';
import { disconnect } from './db';
import { initSocket } from './socket';

const app = createApp();
const server = require('http').createServer(app);
initSocket(server);
server.listen(env.PORT, () => logger.info({ port: env.PORT }, 'API listening'));

let shuttingDown = false;
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'shutting down');
  try { server.close(); } catch {}
  try { await disconnect(); } catch {}
  setTimeout(() => process.exit(0), 250).unref();
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
// ts-node-dev sends SIGUSR2 before respawning the child
process.on('SIGUSR2', () => shutdown('SIGUSR2'));