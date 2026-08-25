import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear any old demo data
  await prisma.review.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin Account
  const adminPasswordHash = await bcrypt.hash('admin123password', 10);
  await prisma.user.create({
    data: {
      name: 'Platform Admin',
      email: 'admin@emerkato.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
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
  console.log('Admin Account: admin@emerkato.com / admin123password');
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
