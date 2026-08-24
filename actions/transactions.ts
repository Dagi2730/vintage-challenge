'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { hasDbConfiguration } from '@/lib/account-store';
import { ListingStatus, TransactionStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function createTransaction(listingId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('You must be logged in to purchase an item.');
  }

  if (!hasDbConfiguration()) {
    throw new Error('Database is not configured. Add DATABASE_URL to complete purchases.');
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { seller: { select: { id: true, name: true } } },
  });

  if (!listing) {
    throw new Error('Listing not found.');
  }

  if (listing.status !== ListingStatus.ACTIVE) {
    throw new Error('This listing is no longer available.');
  }

  if (listing.sellerId === session.user.id) {
    throw new Error('You cannot purchase your own listing.');
  }

  const existingTransaction = await prisma.transaction.findFirst({
    where: {
      listingId,
      buyerId: session.user.id,
      status: { in: [TransactionStatus.PENDING, TransactionStatus.SUCCESS] },
    },
  });

  if (existingTransaction) {
    return { success: true, data: existingTransaction, message: 'Transaction already exists.' };
  }

  const transaction = await prisma.transaction.create({
    data: {
      listingId,
      buyerId: session.user.id,
      sellerId: listing.sellerId,
      amount: listing.price,
      status: TransactionStatus.PENDING,
      paymentGatewayRef: `chapa_${Date.now()}`,
    },
  });

  revalidatePath(`/listings/${listingId}`);
  revalidatePath('/dashboard');

  return { success: true, data: transaction };
}

export async function completeTransaction(transactionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('You must be logged in.');
  }

  if (!hasDbConfiguration()) {
    throw new Error('Database is not configured.');
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { listing: true },
  });

  if (!transaction) {
    throw new Error('Transaction not found.');
  }

  if (transaction.buyerId !== session.user.id) {
    throw new Error('Only the buyer can complete this payment.');
  }

  if (transaction.status === TransactionStatus.SUCCESS) {
    return { success: true, data: transaction, message: 'Payment already completed.' };
  }

  const updated = await prisma.$transaction(async (tx) => {
    const completed = await tx.transaction.update({
      where: { id: transactionId },
      data: { status: TransactionStatus.SUCCESS },
    });

    await tx.listing.update({
      where: { id: transaction.listingId },
      data: { status: ListingStatus.SOLD },
    });

    return completed;
  });

  revalidatePath(`/listings/${transaction.listingId}`);
  revalidatePath('/dashboard');

  return { success: true, data: updated };
}

export async function getUserTransactions(userId: string) {
  if (!hasDbConfiguration()) {
    return { purchases: [], sales: [] };
  }

  try {
    const [purchases, sales] = await Promise.all([
      prisma.transaction.findMany({
        where: { buyerId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          listing: { select: { id: true, title: true, photos: true, price: true } },
          seller: { select: { id: true, name: true } },
        },
      }),
      prisma.transaction.findMany({
        where: { sellerId: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          listing: { select: { id: true, title: true, photos: true, price: true } },
          buyer: { select: { id: true, name: true } },
        },
      }),
    ]);

    return { purchases, sales };
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return { purchases: [], sales: [] };
  }
}
