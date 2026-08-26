"use server";

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { hasDbConfiguration } from '@/lib/account-store';
import { z } from 'zod';
import { Condition, ListingStatus, Prisma } from '@prisma/client';
import { mockCategories } from '@/src/data/mockData';
import {
  saveMemoryListing,
  getAllMemoryListings,
  deleteMemoryListing,
} from '@/lib/listing-store';
import { revalidatePath } from 'next/cache';
import { ensureUserExists, getUserProfile } from '@/actions/user';

const createListingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(20, "Please provide a more detailed description."),
  price: z.coerce.number().positive("Price must be a positive number."),
  condition: z.nativeEnum(Condition),
  city: z.string().min(1, "City is required."),
  neighborhood: z.string().min(1, "Neighborhood is required."),
  categoryId: z.string().min(1, "Category is required."),
  photos: z.array(z.string().min(1, "Photo URL or image data required.")).min(3, "At least three photos are required.").max(5, "You may upload up to five photos."),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;

export type SearchListingsParams = {
  keyword?: string;
  categoryId?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: Condition;
  city?: string;
  neighborhood?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc';
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
    return { success: false, error: "Unauthorized: You must be logged in to create a listing." };
  }

  const validated = createListingSchema.safeParse(input);
  if (!validated.success) {
    const message = validated.error.errors.map((issue) => issue.message).join(' ');
    return { success: false, error: message || "Invalid listing data provided." };
  }

  if (!hasDbConfiguration()) {
    const categoryName = mockCategories.find((c) => c.id === validated.data.categoryId)?.name ?? 'General';
    const newListing = {
      id: `listing_${Date.now()}`,
      sellerId: session.user.id,
      categoryId: validated.data.categoryId,
      title: validated.data.title,
      description: validated.data.description,
      price: validated.data.price,
      condition: validated.data.condition,
      city: validated.data.city,
      neighborhood: validated.data.neighborhood,
      status: ListingStatus.ACTIVE,
      photos: validated.data.photos,
      createdAt: new Date(),
      category: { name: categoryName, slug: categoryName.toLowerCase() },
      seller: {
        id: session.user.id,
        name: session.user.name ?? 'Seller',
        rating: 5.0,
        verifiedStatus: Boolean(session.user.verifiedStatus),
      },
    };

    saveMemoryListing(newListing);

    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath('/explore');
    revalidatePath('/sell');

    return { success: true, data: newListing };
  }

  try {
    await ensureUserExists(session.user);

    // Resolve categoryId to guarantee foreign key constraint is satisfied
    let categoryId = validated.data.categoryId;
    const catExists = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!catExists) {
      const anyCat = await prisma.category.findFirst();
      if (anyCat) {
        categoryId = anyCat.id;
      }
    }

    const listing = await prisma.listing.create({
      data: {
        ...validated.data,
        categoryId,
        sellerId: session.user.id,
        status: ListingStatus.ACTIVE,
      },
      include: listingInclude,
    });

    saveMemoryListing({
      ...listing,
      category: listing.category ?? { name: 'General', slug: 'general' },
      seller: listing.seller ?? { name: session.user.name || 'Seller', rating: 5.0, verifiedStatus: true },
    });

    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath('/explore');

    return { success: true, data: listing };
  } catch (error) {
    console.error("Error creating listing in DB:", error);
    return { success: false, error: "Failed to create listing in database." };
  }
}

export async function getListingById(id: string) {
  let listing: any = null;

  if (!hasDbConfiguration()) {
    const allListings = getAllMemoryListings();
    listing = allListings.find((item) => item.id === id);
  } else {
    try {
      listing = await prisma.listing.findUnique({
        where: { id },
        include: listingInclude,
      });
    } catch (error) {
      console.error("Error fetching listing:", error);
      throw new Error("Failed to fetch listing.");
    }
  }

  if (!listing) return null;

  const sellerProfile = await getUserProfile(listing.sellerId);

  return {
    ...listing,
    category: listing.category ?? { name: 'General', slug: 'general' },
    seller: {
      id: listing.sellerId,
      name: sellerProfile.name || listing.seller?.name || 'Local Seller',
      rating: listing.seller?.rating ?? 5.0,
      verifiedStatus: sellerProfile.verifiedStatus,
      phoneNumber: sellerProfile.phoneNumber || (listing.seller as any)?.phoneNumber || '',
      telegramHandle: sellerProfile.telegramHandle || (listing.seller as any)?.telegramHandle || '',
    },
  };
}

export async function getUserListings(userId: string) {
  const session = await auth();
  // IDOR guard: users may only read their own listings (admins can read any)
  if (!session?.user?.id || (session.user.id !== userId && session.user.role !== 'ADMIN')) {
    return [];
  }

  if (!hasDbConfiguration()) {
    const allListings = getAllMemoryListings();
    return allListings.filter((listing) => listing.sellerId === userId);
  }

  try {
    return await prisma.listing.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { name: true, slug: true } } },
    });
  } catch (error) {
    console.error("Error fetching user listings:", error);
    throw new Error("Failed to fetch user listings.");
  }
}

export async function searchListings(params: SearchListingsParams = {}) {
  const {
    keyword,
    categoryId,
    categorySlug,
    minPrice,
    maxPrice,
    condition,
    city,
    neighborhood,
    sortBy = 'newest',
    page = 1,
    limit = 20,
  } = params;

  if (!hasDbConfiguration()) {
    let results = getAllMemoryListings();

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

    if (city) {
      results = results.filter((listing) =>
        listing.city.toLowerCase().includes(city.toLowerCase()),
      );
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

    if (sortBy === 'price_asc') {
      results.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      results.sort((a, b) => b.price - a.price);
    } else {
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = results.length;
    const start = (page - 1) * limit;
    const data = results.slice(start, start + limit).map((listing) => ({
      ...listing,
      category: listing.category ?? { name: 'General', slug: 'general' },
      seller: listing.seller ?? { name: 'Local Seller', rating: 5.0, verifiedStatus: true },
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

  if (city) {
    where.city = { contains: city, mode: 'insensitive' };
  }

  if (neighborhood) {
    where.neighborhood = { contains: neighborhood, mode: 'insensitive' };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  const orderBy =
    sortBy === 'price_asc'
      ? { price: 'asc' as const }
      : sortBy === 'price_desc'
      ? { price: 'desc' as const }
      : { createdAt: 'desc' as const };

  const skip = (page - 1) * limit;

  try {
    const [listings, totalCount] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
    return {
      success: false,
      error: "Failed to search listings.",
      data: [],
      metadata: { total: 0, page, limit, totalPages: 0 },
    };
  }
}

export async function reportListing(input: {
  listingId: string;
  reason: string;
  details?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'You must be logged in to report a listing.' };
  }

  const reporterId = session.user.id;

  if (!hasDbConfiguration()) {
    try {
      await prisma.report.create({
        data: {
          listingId: input.listingId,
          reporterId,
          reason: input.reason,
          details: input.details || null,
        },
      });
    } catch (e) {
      console.error('Error recording report in DB:', e);
      return { success: false, error: 'Failed to record report.' };
    }
  }

  return { success: true };
}

export async function deleteListing(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized: You must be logged in to delete a listing.' };
  }

  // Delete from memory store
  deleteMemoryListing(id);

  if (hasDbConfiguration()) {
    try {
      await prisma.transaction.deleteMany({ where: { listingId: id } });
      await prisma.report.deleteMany({ where: { listingId: id } });
      await prisma.listing.deleteMany({ where: { id } });
    } catch (error) {
      console.error('Error deleting listing from DB:', error);
    }
  }

  revalidatePath('/');
  revalidatePath('/dashboard');
  revalidatePath('/explore');
  revalidatePath('/account');
  revalidatePath('/admin');
  return { success: true, message: 'Listing deleted successfully.' };
}