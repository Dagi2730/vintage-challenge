"use server";

import { auth } from '../auth';
import prisma from '../lib/prisma';
import { z } from 'zod';
import { Condition, ListingStatus, Prisma } from '@prisma/client';

// -----------------------------------------------------------------------------
// INPUT VALIDATION SCHEMAS
// -----------------------------------------------------------------------------
const createListingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(20, "Please provide a more detailed description."),
  price: z.coerce.number().positive("Price must be a positive number."),
  condition: z.nativeEnum(Condition),
  city: z.string().min(1, "City is required."),
  neighborhood: z.string().min(1, "Neighborhood is required."),
  categoryId: z.string().uuid("Invalid category ID."),
  // Cloudinary (or any CDN) URLs
  photos: z.array(z.string().url("Must be valid image URLs.")).min(1, "At least one photo is required."),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;

export type SearchListingsParams = {
  keyword?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: Condition;
  neighborhood?: string;
  page?: number;
  limit?: number;
};

// -----------------------------------------------------------------------------
// SERVER ACTIONS
// -----------------------------------------------------------------------------

/**
 * Creates a new listing for the authenticated user.
 */
export async function createListing(input: CreateListingInput) {
  // 1. Authenticate and Authorize
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: You must be logged in to create a listing.");
  }

  // (Optional) Enforce seller verification rules:
  // if (!session.user.verifiedStatus) throw new Error("Unauthorized: Only verified sellers can post listings.");

  // 2. Validate input data
  const validated = createListingSchema.safeParse(input);
  if (!validated.success) {
    console.error("Validation failed:", validated.error.flatten());
    throw new Error("Invalid listing data provided.");
  }

  // 3. Persist to Database
  try {
    const listing = await prisma.listing.create({
      data: {
        ...validated.data,
        sellerId: session.user.id,
        status: ListingStatus.ACTIVE,
      }
    });

    return { success: true, data: listing };
  } catch (error) {
    console.error("Error creating listing:", error);
    throw new Error("Internal Server Error: Failed to create listing.");
  }
}


/**
 * Fetches listings with dynamic filtering and PostgreSQL Full-Text Search.
 */
export async function searchListings(params: SearchListingsParams) {
  const { 
    keyword, 
    categoryId, 
    minPrice, 
    maxPrice, 
    condition, 
    neighborhood,
    page = 1,
    limit = 20
  } = params;

  // 1. Build the dynamic base where clause
  const where: Prisma.ListingWhereInput = {
    status: ListingStatus.ACTIVE, // Never show sold/inactive listings in search
  };

  // 2. Postgres Full-Text Search Integration
  if (keyword && keyword.trim() !== '') {
    // Format the query for Postgres tsquery. 
    // Converting spaces to ' & ' ensures all terms must be present.
    const searchQuery = keyword.trim().split(/\s+/).join(' & ');
    
    // We search across BOTH title and description
    where.OR = [
      { title: { search: searchQuery } },
      { description: { search: searchQuery } }
    ];
  }

  // 3. Relational and Exact Match Filters
  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (condition) {
    where.condition = condition;
  }

  // 4. Case-Insensitive String Filter
  if (neighborhood) {
    where.neighborhood = { contains: neighborhood, mode: 'insensitive' };
  }

  // 5. Range Filters (Price)
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  // 6. Execute Query with Pagination
  const skip = (page - 1) * limit;
  
  try {
    const [listings, totalCount] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        // Include light payloads for UI display
        include: {
          category: { select: { name: true, slug: true } },
          seller: { select: { name: true, rating: true, verifiedStatus: true } }
        }
      }),
      prisma.listing.count({ where })
    ]);

    return {
      success: true,
      data: listings,
      metadata: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  } catch (error) {
    console.error("Error executing search:", error);
    throw new Error("Failed to search listings.");
  }
}
