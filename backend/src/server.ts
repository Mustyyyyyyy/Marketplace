import { createApp } from './app';
import { env } from './config';
import { logger } from './logger';
import { disconnect, prisma } from './db';
import { initSocket } from './socket';
import { ensureInitialAdmin, getSiteSettings } from './services/adminService';
import { sendEmail, welcomeEmail } from './services/emailService';

// One-time bootstrap: if the DB has no admins and ADMIN_BOOTSTRAP_EMAIL is set
// in the env, create the first admin. We do this before binding the port so
// the operator can sign in immediately after the first deploy.
async function bootstrapAdmin() {
  try {
    // Ensure SiteSettings singleton exists
    await getSiteSettings();
  } catch (e) { logger.warn({ err: String(e) }, 'site settings bootstrap failed'); }

  const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL;
  if (!adminEmail) return;
  try {
    const count = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (count > 0) {
      logger.info({ adminCount: count }, 'admin bootstrap skipped (admins exist)');
      return;
    }
    const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || require('crypto').randomBytes(18).toString('base64url');
    const user = await ensureInitialAdmin(adminEmail, password);
    logger.info({ id: user.id, email: user.email }, 'admin bootstrap created initial admin');
    if (!process.env.ADMIN_BOOTSTRAP_PASSWORD) {
      // Print once to stdout so the operator can copy it from the logs.
      console.log(`\n========================================`);
      console.log(`  Initial admin created`);
      console.log(`  Email:    ${user.email}`);
      console.log(`  Password: ${password}`);
      console.log(`  Sign in at <your-frontend>/sign-in`);
      console.log(`========================================\n`);
    }
    try {
      const tpl = welcomeEmail({ name: user.displayName || 'Admin', role: 'CUSTOMER' });
      await sendEmail({ to: user.email, subject: 'TaskSphere admin account created', html: tpl.html, text: `Your admin account is ready. Sign in at <your-frontend>/sign-in` });
    } catch { /* email is best-effort */ }
  } catch (e) {
    logger.error({ err: String(e) }, 'admin bootstrap failed');
  }
}

async function main() {
  await bootstrapAdmin();
  const app = createApp();
  const server = require('http').createServer(app);
  initSocket(server);
  server.listen(env.PORT, () => logger.info({ port: env.PORT }, 'API listening'));
  return server;
}

let _server: any = null;
main().then((s) => { _server = s; }).catch((e) => {
  logger.error({ err: String(e) }, 'startup failed');
  process.exit(1);
});

let shuttingDown = false;
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'shutting down');
  try { _server?.close(); } catch {}
  try { await disconnect(); } catch {}
  setTimeout(() => process.exit(0), 250).unref();
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
// ts-node-dev sends SIGUSR2 before respawning the child
process.on('SIGUSR2', () => shutdown('SIGUSR2'));