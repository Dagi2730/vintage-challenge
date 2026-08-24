import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const photoSets = {
  camera: [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80',
  ],
  sofa: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1617104678098-de229db51175?auto=format&fit=crop&q=80',
  ],
  guitar: [
    'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1525201548947-d31bc6c38bb5?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80',
  ],
  denim: [
    'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1475178626620-a4d074967452?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80',
  ],
};

async function main() {
  await prisma.review.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Abebe Kebede',
      email: 'abebe@example.com',
      passwordHash: hashedPassword,
      verifiedStatus: true,
      rating: 4.8,
    },
  });

  const electronics = await prisma.category.create({
    data: { name: 'Electronics', slug: 'electronics', icon: '⚡' },
  });
  const furniture = await prisma.category.create({
    data: { name: 'Furniture', slug: 'furniture', icon: '🪑' },
  });
  const vehicles = await prisma.category.create({
    data: { name: 'Vehicles', slug: 'vehicles', icon: '🚗' },
  });
  const apparel = await prisma.category.create({
    data: { name: 'Apparel', slug: 'apparel', icon: '👕' },
  });

  await prisma.listing.createMany({
    data: [
      {
        sellerId: user.id,
        categoryId: electronics.id,
        title: 'Vintage Film Camera',
        description: 'Classic 35mm film camera in great working condition.',
        price: 120,
        condition: 'LIGHTLY_USED',
        city: 'Addis Ababa',
        neighborhood: 'Bole',
        photos: photoSets.camera,
      },
      {
        sellerId: user.id,
        categoryId: furniture.id,
        title: 'Modern Grey Sofa',
        description: 'Comfortable 3-seater velvet sofa, gently used.',
        price: 450,
        condition: 'LIKE_NEW',
        city: 'Addis Ababa',
        neighborhood: 'Kazanchis',
        photos: photoSets.sofa,
      },
      {
        sellerId: user.id,
        categoryId: electronics.id,
        title: 'Matte Electric Guitar',
        description: 'Clean sound, great entry-to-intermediate guitar.',
        price: 300,
        condition: 'FAIR',
        city: 'Addis Ababa',
        neighborhood: 'Piassa',
        photos: photoSets.guitar,
      },
      {
        sellerId: user.id,
        categoryId: apparel.id,
        title: 'Premium Denim Bundle',
        description: 'High-quality denim apparel pack, various sizes.',
        price: 65,
        condition: 'LIGHTLY_USED',
        city: 'Addis Ababa',
        neighborhood: 'CMC',
        photos: photoSets.denim,
      },
    ],
  });

  console.log('Database seeded successfully!');
  console.log('Login with: abebe@example.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
