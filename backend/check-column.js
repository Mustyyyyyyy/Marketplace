const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({ datasources: { db: { url: 'postgresql://neondb_owner:npg_FUt2V0RLvCeP@ep-shy-pond-axnwlyzi-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require' } } });
(async () => {
  try {
    const cols = await p.$queryRawUnsafe(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='User' AND column_name IN ('avatarUrl','avatarPublicId') ORDER BY column_name`);
    console.log('User columns:', JSON.stringify(cols));
    const u = await p.user.findFirst({ select: { id: true, avatarUrl: true, avatarPublicId: true } });
    console.log('user row:', JSON.stringify(u));
  } catch (e) { console.error('err:', e.message); }
  await p.$disconnect();
})();
