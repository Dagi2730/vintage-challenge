'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { hasDbConfiguration } from '@/lib/account-store';
import { TransactionStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const reviewSchema = z.object({
  transactionId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export async function createReview(input: z.infer<typeof reviewSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('You must be logged in to leave a review.');
  }

  if (!hasDbConfiguration()) {
    throw new Error('Database is not configured.');
  }

  const validated = reviewSchema.safeParse(input);
  if (!validated.success) {
    throw new Error('Invalid review data.');
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: validated.data.transactionId },
    include: { reviews: true },
  });

  if (!transaction) {
    throw new Error('Transaction not found.');
  }

  if (transaction.buyerId !== session.user.id) {
    throw new Error('Only the buyer can leave a review.');
  }

  if (transaction.status !== TransactionStatus.SUCCESS) {
    throw new Error('You can only review completed purchases.');
  }

  const existingReview = transaction.reviews.find(
    (review) => review.reviewerId === session.user!.id,
  );

  if (existingReview) {
    throw new Error('You have already reviewed this transaction.');
  }

  await prisma.$transaction(async (tx) => {
    await tx.review.create({
      data: {
        transactionId: transaction.id,
        reviewerId: session.user!.id,
        sellerId: transaction.sellerId,
        rating: validated.data.rating,
        comment: validated.data.comment,
      },
    });

    const sellerReviews = await tx.review.findMany({
      where: { sellerId: transaction.sellerId },
      select: { rating: true },
    });

    const averageRating =
      sellerReviews.reduce((sum, review) => sum + review.rating, 0) / sellerReviews.length;

    await tx.user.update({
      where: { id: transaction.sellerId },
      data: { rating: Number(averageRating.toFixed(1)) },
    });
  });

  revalidatePath('/dashboard');
  revalidatePath(`/listings/${transaction.listingId}`);

  return { success: true };
}

export async function getSellerReviews(sellerId: string) {
  if (!hasDbConfiguration()) {
    return [];
  }

  try {
    return await prisma.review.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: { select: { name: true } },
        transaction: {
          include: {
            listing: { select: { title: true } },
          },
        },
      },
    });
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return [];
  }
}

export async function getReviewableTransactions(userId: string) {
  if (!hasDbConfiguration()) {
    return [];
  }

  try {
    return await prisma.transaction.findMany({
      where: {
        buyerId: userId,
        status: TransactionStatus.SUCCESS,
        reviews: { none: { reviewerId: userId } },
      },
      include: {
        listing: { select: { id: true, title: true } },
        seller: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Failed to fetch reviewable transactions:', error);
    return [];
  }
}
