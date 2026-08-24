import type { Category, Listing, User, Review, Transaction } from '@/src/types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Abebe Kebede',
    email: 'abebe@example.com',
    passwordHash: 'hashed-password-placeholder',
    role: 'USER',
    verifiedStatus: true,
    rating: 4.8,
    createdAt: new Date('2026-01-01T12:00:00Z'),
  },
];

export const mockCategories: Category[] = [
  { id: 'cat-electronics', name: 'Electronics', slug: 'electronics', icon: '⚡' },
  { id: 'cat-furniture', name: 'Furniture', slug: 'furniture', icon: '🪑' },
  { id: 'cat-vehicles', name: 'Vehicles', slug: 'vehicles', icon: '🚗' },
  { id: 'cat-apparel', name: 'Apparel', slug: 'apparel', icon: '👕' },
];

export const mockListings: Listing[] = [
  {
    id: 'listing-1',
    sellerId: 'user-1',
    categoryId: 'cat-electronics',
    title: 'Vintage Film Camera',
    description: 'Classic 35mm film camera in great working condition.',
    price: 120,
    condition: 'LIGHTLY_USED',
    city: 'Addis Ababa',
    neighborhood: 'Bole',
    status: 'ACTIVE',
    photos: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80',
    ],
    createdAt: new Date('2026-01-02T10:00:00Z'),
  },
  {
    id: 'listing-2',
    sellerId: 'user-1',
    categoryId: 'cat-furniture',
    title: 'Modern Grey Sofa',
    description: 'Comfortable 3-seater velvet sofa, gently used.',
    price: 450,
    condition: 'LIKE_NEW',
    city: 'Addis Ababa',
    neighborhood: 'Kazanchis',
    status: 'ACTIVE',
    photos: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
      'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1617104678098-de229db51175?auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80',
    ],
    createdAt: new Date('2026-01-03T16:00:00Z'),
  },
  {
    id: 'listing-3',
    sellerId: 'user-1',
    categoryId: 'cat-electronics',
    title: 'Matte Electric Guitar',
    description: 'Clean sound, great entry-to-intermediate guitar.',
    price: 300,
    condition: 'FAIR',
    city: 'Addis Ababa',
    neighborhood: 'Piassa',
    status: 'ACTIVE',
    photos: [
      'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f',
      'https://images.unsplash.com/photo-1525201548947-d31bc6c38bb5?auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80',
    ],
    createdAt: new Date('2026-01-04T08:00:00Z'),
  },
  {
    id: 'listing-4',
    sellerId: 'user-1',
    categoryId: 'cat-apparel',
    title: 'Premium Denim Bundle',
    description: 'High-quality denim apparel pack, various sizes.',
    price: 65,
    condition: 'LIGHTLY_USED',
    city: 'Addis Ababa',
    neighborhood: 'CMC',
    status: 'ACTIVE',
    photos: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80',
    ],
    createdAt: new Date('2026-01-05T09:30:00Z'),
  },
];

export const mockReviews: Review[] = [];

export const mockTransactions: Transaction[] = [];

export const mockSearchResults = mockListings;
