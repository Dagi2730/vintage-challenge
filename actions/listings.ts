"use server";

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { hasDbConfiguration } from '@/lib/account-store';
import { z } from 'zod';
import { Condition, ListingStatus, Prisma } from '@prisma/client';
import { mockCategories, mockListings } from '@/src/data/mockData';

const createListingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(20, "Please provide a more detailed description."),
  price: z.coerce.number().positive("Price must be a positive number."),
  condition: z.nativeEnum(Condition),
  city: z.string().min(1, "City is required."),
  neighborhood: z.string().min(1, "Neighborhood is required."),
  categoryId: z.string().min(1, "Category is required."),
  photos: z.array(z.string().url("Must be valid image URLs.")).min(3, "At least three photos are required.").max(5, "You may upload up to five photos."),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;

export type SearchListingsParams = {
  keyword?: string;
  categoryId?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: Condition;
  neighborhood?: string;
  page?: number;
  limit?: number;
};

const listingInclude = {
  category: { select: { name: true, slug: true } },
  seller: { select: { id: true, name: true, rating: true, verifiedStatus: true } },
} as const;

export async function createListing(input: CreateListingInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to create a listing.");
  }

  if (!hasDbConfiguration()) {
    throw new Error("Database is not configured. Add DATABASE_URL to create listings.");
  }

  const validated = createListingSchema.safeParse(input);
  if (!validated.success) {
    const message = validated.error.errors.map((issue) => issue.message).join(' ');
    throw new Error(message || "Invalid listing data provided.");
  }

  try {
    const listing = await prisma.listing.create({
      data: {
        ...validated.data,
        sellerId: session.user.id,
        status: ListingStatus.ACTIVE,
      },
    });

    return { success: true, data: listing };
  } catch (error) {
    console.error("Error creating listing:", error);
    throw new Error("Internal Server Error: Failed to create listing.");
  }
}

export async function getListingById(id: string) {
  if (!hasDbConfiguration()) {
    const listing = mockListings.find((item) => item.id === id);
    if (!listing) return null;

    return {
      ...listing,
      category: { name: 'General', slug: 'general' },
      seller: {
        id: listing.sellerId,
        name: 'Local Seller',
        rating: 4.8,
        verifiedStatus: true,
      },
    };
  }

  try {
    return await prisma.listing.findUnique({
      where: { id },
      include: listingInclude,
    });
  } catch (error) {
    console.error("Error fetching listing:", error);
    return null;
  }
}

export async function getUserListings(userId: string) {
  if (!hasDbConfiguration()) {
    return mockListings.filter((listing) => listing.sellerId === userId);
  }

  try {
    return await prisma.listing.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { name: true, slug: true } } },
    });
  } catch (error) {
    console.error("Error fetching user listings:", error);
    return [];
  }
}

export async function searchListings(params: SearchListingsParams) {
  const {
    keyword,
    categoryId,
    categorySlug,
    minPrice,
    maxPrice,
    condition,
    neighborhood,
    page = 1,
    limit = 20,
  } = params;

  if (!hasDbConfiguration()) {
    let results = [...mockListings];

    if (keyword?.trim()) {
      const term = keyword.trim().toLowerCase();
      results = results.filter(
        (listing) =>
          listing.title.toLowerCase().includes(term) ||
          listing.description.toLowerCase().includes(term),
      );
    }

    if (categorySlug) {
      const category = mockCategories.find((item) => item.slug === categorySlug);
      if (category) {
        results = results.filter((listing) => listing.categoryId === category.id);
      }
    }

    if (condition) {
      results = results.filter((listing) => listing.condition === condition);
    }

    if (neighborhood) {
      results = results.filter((listing) =>
        listing.neighborhood.toLowerCase().includes(neighborhood.toLowerCase()),
      );
    }

    if (minPrice !== undefined) {
      results = results.filter((listing) => listing.price >= minPrice);
    }

    if (maxPrice !== undefined) {
      results = results.filter((listing) => listing.price <= maxPrice);
    }

    const total = results.length;
    const start = (page - 1) * limit;
    const data = results.slice(start, start + limit).map((listing) => ({
      ...listing,
      category: { name: 'General', slug: 'general' },
      seller: { name: 'Local Seller', rating: 4.8, verifiedStatus: true },
    }));

    return {
      success: true,
      data,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  const where: Prisma.ListingWhereInput = {
    status: ListingStatus.ACTIVE,
  };

  if (keyword && keyword.trim() !== '') {
    const term = keyword.trim();
    where.OR = [
      { title: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (condition) {
    where.condition = condition;
  }

  if (neighborhood) {
    where.neighborhood = { contains: neighborhood, mode: 'insensitive' };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  const skip = (page - 1) * limit;

  try {
    const [listings, totalCount] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: listingInclude,
      }),
      prisma.listing.count({ where }),
    ]);

    return {
      success: true,
      data: listings,
      metadata: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error) {
    console.error("Error executing search:", error);
    throw new Error("Failed to search listings.");
  }
}
