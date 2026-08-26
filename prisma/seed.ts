import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? 'admin@merkato.com').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123';

async function main() {
  // Clear any old demo data
  await prisma.review.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.report.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin Account (credentials from environment)
  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.user.create({
    data: {
      name: 'Platform Admin',
      email: ADMIN_EMAIL,
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      verificationState: 'VERIFIED',
      verifiedStatus: true,
      rating: 5.0,
    },
  });

  // Create Standard Categories
  await prisma.category.createMany({
    data: [
      { name: 'Electronics', slug: 'electronics', icon: '⚡' },
      { name: 'Furniture', slug: 'furniture', icon: '🪑' },
      { name: 'Vehicles', slug: 'vehicles', icon: '🚗' },
      { name: 'Apparel', slug: 'apparel', icon: '👕' },
    ],
  });

  console.log('Database cleaned and initialized successfully!');
  console.log(`Admin Account: ${ADMIN_EMAIL} / (set via ADMIN_PASSWORD env)`);
  console.log('Demo items & demo users removed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
