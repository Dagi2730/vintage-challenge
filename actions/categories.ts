'use server';

import { prisma } from '@/lib/prisma';
import { hasDbConfiguration } from '@/lib/account-store';
import { mockCategories } from '@/src/data/mockData';

export async function getCategories() {
  if (!hasDbConfiguration()) {
    return mockCategories;
  }

  try {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return mockCategories;
  }
}

export async function getCategoryBySlug(slug: string) {
  if (!hasDbConfiguration()) {
    return mockCategories.find((category) => category.slug === slug) ?? null;
  }

  try {
    return await prisma.category.findUnique({
      where: { slug },
    });
  } catch (error) {
    console.error('Failed to fetch category:', error);
    return mockCategories.find((category) => category.slug === slug) ?? null;
  }
}
