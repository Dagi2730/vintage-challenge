'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createReview } from '@/actions/reviews';

type ReviewFormProps = {
  transactionId: string;
  sellerName: string;
  listingTitle: string;
};

export function ReviewForm({ transactionId, sellerName, listingTitle }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createReview({ transactionId, rating, comment: comment || undefined });
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
      <div>
        <h4 className="text-sm font-semibold text-slate-900">Review {sellerName}</h4>
        <p className="text-xs text-slate-500">For: {listingTitle}</p>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-600 block mb-1">Rating</label>
        <select
          value={rating}
          onChange={(event) => setRating(Number(event.target.value))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} star{value === 1 ? '' : 's'}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-slate-600 block mb-1">Comment (optional)</label>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Share your experience with this seller..."
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
