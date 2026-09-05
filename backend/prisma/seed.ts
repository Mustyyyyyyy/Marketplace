import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'Home Services', slug: 'home-services', icon: 'home' },
  { name: 'Cleaning', slug: 'cleaning', icon: 'broom', parent: 'home-services' },
  { name: 'Plumbing', slug: 'plumbing', icon: 'wrench', parent: 'home-services' },
  { name: 'Electrical', slug: 'electrical', icon: 'bolt', parent: 'home-services' },
  { name: 'Moving & Delivery', slug: 'moving-delivery', icon: 'truck' },
  { name: 'Handyman', slug: 'handyman', icon: 'tools' },
  { name: 'Tutoring & Education', slug: 'tutoring', icon: 'book' },
  { name: 'Tech & IT', slug: 'tech-it', icon: 'cpu' },
  { name: 'Web Development', slug: 'web-development', icon: 'code', parent: 'tech-it' },
  { name: 'Mobile Development', slug: 'mobile-development', icon: 'phone', parent: 'tech-it' },
  { name: 'Design & Creative', slug: 'design', icon: 'palette' },
  { name: 'Graphic Design', slug: 'graphic-design', icon: 'pen', parent: 'design' },
  { name: 'Photography', slug: 'photography', icon: 'camera' },
  { name: 'Event Services', slug: 'events', icon: 'calendar' },
  { name: 'Beauty & Wellness', slug: 'beauty', icon: 'heart' },
  { name: 'Auto Services', slug: 'auto', icon: 'car' },
  { name: 'Business & Admin', slug: 'business', icon: 'briefcase' },
  { name: 'Writing & Translation', slug: 'writing', icon: 'pen' },
];

async function main() {
  for (const c of CATEGORIES) {
    let parentId: string | undefined;
    if ((c as any).parent) {
      const p = await prisma.category.findUnique({ where: { slug: (c as any).parent } });
      parentId = p?.id;
    }
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon, parentId },
      create: { name: c.name, slug: c.slug, icon: c.icon, parentId },
    });
  }
  console.log('Seeded categories:', CATEGORIES.length);

  const adminEmail = 'admin@marketplace.local';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await hashPassword('Admin123!ChangeMe'),
        role: 'ADMIN',
        status: 'ACTIVE',
        emailVerified: true,
        displayName: 'Platform Admin',
        country: 'NG',
        currency: 'NGN',
        locale: 'en',
        timezone: 'Africa/Lagos',
      },
    });
    console.log('Seeded admin:', adminEmail, 'password: Admin123!ChangeMe');
  }
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });