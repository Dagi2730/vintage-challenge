'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteListing } from '@/actions/listings';

type DeleteListingButtonProps = {
  listingId: string;
  redirectAfterDelete?: boolean;
  className?: string;
};

export function DeleteListingButton({
  listingId,
  redirectAfterDelete = true,
  className = '',
}: DeleteListingButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await deleteListing(listingId);
      if (res?.success) {
        if (redirectAfterDelete) {
          router.push('/dashboard');
        } else {
          router.refresh();
          window.location.reload();
        }
      } else {
        alert(res?.error || 'Failed to delete listing.');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete listing.');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  }

  if (showConfirm) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center space-y-2">
        <p className="text-xs font-bold text-red-700">Are you sure you want to delete this listing?</p>
        <div className="flex justify-center gap-2">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shadow-2xs disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Yes, Delete'}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-xs px-3 py-1.5 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className={
        className ||
        'w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold py-2.5 px-4 rounded-xl transition text-xs flex items-center justify-center gap-1.5 shadow-2xs'
      }
    >
      <span>🗑️</span> Delete Listing
    </button>
  );
}
