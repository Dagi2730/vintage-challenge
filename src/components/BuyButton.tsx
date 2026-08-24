'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTransaction, completeTransaction } from '@/actions/transactions';

type BuyButtonProps = {
  listingId: string;
  price: number;
  isLoggedIn: boolean;
  isOwner: boolean;
  isSold: boolean;
};

export function BuyButton({ listingId, price, isLoggedIn, isOwner, isSold }: BuyButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePurchase() {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await createTransaction(listingId);
      if (!result.success || !result.data) {
        setError('Unable to start checkout.');
        return;
      }

      const payment = await completeTransaction(result.data.id);
      if (payment.success) {
        setMessage('Payment successful via Chapa. The seller has been notified.');
        router.refresh();
      } else {
        setError('Payment could not be completed.');
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Purchase failed.');
    } finally {
      setLoading(false);
    }
  }

  if (isSold) {
    return (
      <div className="w-full bg-slate-100 border border-slate-200 text-slate-500 font-bold py-3 rounded-lg text-sm text-center tracking-wide uppercase cursor-default shadow-xs flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-slate-400"></span>
        Item Sold
      </div>
    );
  }

  if (isOwner) {
    return (
      <button
        type="button"
        disabled
        className="w-full bg-slate-100 border border-slate-200 text-slate-400 font-medium py-3 rounded-lg text-sm cursor-not-allowed"
      >
        This is your listing
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handlePurchase}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 rounded-lg transition shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          `Buy with Chapa · ${price.toLocaleString()} ETB`
        )}
      </button>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold py-2.5 px-3 rounded-lg flex items-center gap-2 shadow-xs">
          <span>🎉</span>
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium py-2.5 px-3 rounded-lg flex items-center gap-2 shadow-xs">
          <span>ℹ️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
