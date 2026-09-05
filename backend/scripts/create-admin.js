#!/usr/bin/env node
// CLI: create / promote an admin user.
// Usage:
//   node scripts/create-admin.js <email> [password]
//   node scripts/create-admin.js promote <userId>
//
// If the user already exists they are promoted to ADMIN.
// If they don't exist a random password is generated and printed.

require('dotenv').config();
const { ensureInitialAdmin } = require('../dist/services/adminService').default || {};
const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../dist/utils/password');
const { randomBytes } = require('crypto');

(async () => {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node scripts/create-admin.js <email> [password]');
    console.log('  node scripts/create-admin.js promote <userId>');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    if (args[0] === 'promote') {
      const userId = args[1];
      if (!userId) { console.error('userId required'); process.exit(1); }
      const u = await prisma.user.update({ where: { id: userId }, data: { role: 'ADMIN' } });
      console.log(`✓ Promoted ${u.email} (${u.id}) to ADMIN`);
      process.exit(0);
    }

    const email = args[0].toLowerCase();
    const password = args[1] || randomBytes(18).toString('base64url');

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      await prisma.user.update({ where: { id: existing.id }, data: { role: 'ADMIN', status: 'ACTIVE', kycStatus: 'APPROVED', signupStep: 'COMPLETE' } });
      console.log(`✓ Promoted existing user ${email} to ADMIN (id ${existing.id})`);
      console.log(`  Password unchanged (set via /forgot-password if needed)`);
    } else {
      const passwordHash = await hashPassword(password);
      const u = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'ADMIN',
          status: 'ACTIVE',
          emailVerified: true,
          kycStatus: 'APPROVED',
          signupStep: 'COMPLETE',
          country: 'US',
          currency: 'USD',
          locale: 'en',
          displayName: 'Admin',
        },
      });
      console.log(`✓ Created admin ${email} (id ${u.id})`);
      console.log(`  Password: ${password}`);
      console.log(`  Sign in at /sign-in`);
    }
  } catch (e) {
    console.error('✗ Error:', e.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
