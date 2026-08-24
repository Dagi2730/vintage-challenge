import type { Category, Listing, User, Review, Transaction } from '@/src/types';

export const mockUsers: User[] = [];

export const mockCategories: Category[] = [
  { id: 'cat-electronics', name: 'Electronics', slug: 'electronics', icon: '⚡' },
  { id: 'cat-furniture', name: 'Furniture', slug: 'furniture', icon: '🪑' },
  { id: 'cat-vehicles', name: 'Vehicles', slug: 'vehicles', icon: '🚗' },
  { id: 'cat-apparel', name: 'Apparel', slug: 'apparel', icon: '👕' },
];

export const mockListings: Listing[] = [];

export const mockReviews: Review[] = [];

export const mockTransactions: Transaction[] = [];

export const mockSearchResults = mockListings;
