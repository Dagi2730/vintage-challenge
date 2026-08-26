'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { hasDbConfiguration } from '@/lib/account-store';
import { ListingStatus, TransactionStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { setMemoryListingStatus } from '@/lib/listing-store';
import { mockListings, mockTransactions } from '@/src/data/mockData';
import type { Transaction } from '@/src/types';

export async function createTransaction(listingId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('You must be logged in to purchase an item.');
  }

  if (!hasDbConfiguration()) {
    const listing = mockListings.find((item) => item.id === listingId);
    if (!listing) {
      throw new Error('Listing not found.');
    }

    if (listing.status !== 'ACTIVE') {
      throw new Error('This listing is no longer available.');
    }

    if (listing.sellerId === session.user.id) {
      throw new Error('You cannot purchase your own listing.');
    }

    const existingTransaction = mockTransactions.find(
      (tx) => tx.listingId === listingId && tx.buyerId === session.user.id
    );

    if (existingTransaction) {
      return { success: true, data: existingTransaction, message: 'Transaction already exists.' };
    }

    const mockTx: Transaction = {
      id: `tx_${Date.now()}`,
      listingId,
      buyerId: session.user.id,
      sellerId: listing.sellerId,
      amount: listing.price,
      status: TransactionStatus.PENDING,
      paymentGatewayRef: `chapa_mock_${Date.now()}`,
      createdAt: new Date(),
    };

    mockTransactions.push(mockTx);

    revalidatePath(`/listings/${listingId}`);
    revalidatePath('/dashboard');
    revalidatePath('/explore');
    revalidatePath('/');

    return { success: true, data: mockTx };
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
  revalidatePath('/explore');
  revalidatePath('/');

  return { success: true, data: { ...transaction, amount: Number(transaction.amount) } };
}

export async function completeTransaction(transactionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('You must be logged in.');
  }

  if (!hasDbConfiguration()) {
    const mockTx = mockTransactions.find((tx) => tx.id === transactionId);
    if (!mockTx) {
      // Fallback: search by listing ID if transactionId is listingId
      const listing = mockListings.find((item) => item.id === transactionId);
      if (listing) {
        setMemoryListingStatus(listing.id, ListingStatus.SOLD);
        const fallbackTx: Transaction = {
          id: `tx_${Date.now()}`,
          listingId: listing.id,
          buyerId: session.user.id,
          sellerId: listing.sellerId,
          amount: listing.price,
          status: TransactionStatus.SUCCESS,
          paymentGatewayRef: `chapa_mock_${Date.now()}`,
          createdAt: new Date(),
        };
        mockTransactions.push(fallbackTx);

        revalidatePath(`/listings/${listing.id}`);
        revalidatePath('/dashboard');
        revalidatePath('/explore');
        revalidatePath('/');

        return { success: true, data: fallbackTx };
      }
      throw new Error('Transaction not found.');
    }

    mockTx.status = TransactionStatus.SUCCESS;
    setMemoryListingStatus(mockTx.listingId, ListingStatus.SOLD);

    revalidatePath(`/listings/${mockTx.listingId}`);
    revalidatePath('/dashboard');
    revalidatePath('/explore');
    revalidatePath('/');

    return { success: true, data: mockTx };
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

  // Atomic purchase: claim the listing with a conditional update so that when two
  // buyers race, exactly one wins. updateMany returns a count instead of throwing.
  const claimed = await prisma.listing.updateMany({
    where: { id: transaction.listingId, status: ListingStatus.ACTIVE },
    data: { status: ListingStatus.SOLD },
  });

  if (claimed.count === 0) {
    // Another buyer completed the purchase first
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: TransactionStatus.FAILED },
    });
    throw new Error('Sorry — this item was just sold to another buyer.');
  }

  const updated = await prisma.$transaction(async (tx) => {
    const completed = await tx.transaction.update({
      where: { id: transactionId },
      data: { status: TransactionStatus.SUCCESS },
    });
    return completed;
  });

  revalidatePath(`/listings/${transaction.listingId}`);
  revalidatePath('/dashboard');
  revalidatePath('/explore');
  revalidatePath('/');

  return { success: true, data: { ...updated, amount: Number(updated.amount) } };
}

export async function getUserTransactions(userId: string) {
  const session = await auth();
  // IDOR guard: users may only read their own transaction history
  if (!session?.user?.id || session.user.id !== userId) {
    return { purchases: [], sales: [] };
  }

  if (!hasDbConfiguration()) {
    const purchases = mockTransactions.filter((tx) => tx.buyerId === userId);
    const sales = mockTransactions.filter((tx) => tx.sellerId === userId);

    return {
      purchases: purchases.map((tx) => {
        const listing = mockListings.find((item) => item.id === tx.listingId);
        return {
          ...tx,
          listing: {
            id: listing?.id ?? tx.listingId,
            title: listing?.title ?? 'Item',
            photos: listing?.photos ?? [],
            price: listing?.price ?? tx.amount,
          },
          seller: { id: tx.sellerId, name: 'Local Seller' },
        };
      }),
      sales: sales.map((tx) => {
        const listing = mockListings.find((item) => item.id === tx.listingId);
        return {
          ...tx,
          listing: {
            id: listing?.id ?? tx.listingId,
            title: listing?.title ?? 'Item',
            photos: listing?.photos ?? [],
            price: listing?.price ?? tx.amount,
          },
          buyer: { id: tx.buyerId, name: 'Buyer' },
        };
      }),
    };
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

    return { 
      purchases: purchases.map(p => ({ ...p, amount: Number(p.amount), listing: { ...p.listing, price: Number(p.listing.price) } })),
      sales: sales.map(s => ({ ...s, amount: Number(s.amount), listing: { ...s.listing, price: Number(s.listing.price) } })),
    };
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    throw new Error('Failed to fetch transactions.');
  }
}
