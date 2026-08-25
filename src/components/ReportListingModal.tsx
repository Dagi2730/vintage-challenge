'use client';

import { useState } from 'react';
import { reportListing } from '@/actions/listings';

type ReportListingModalProps = {
  listingId: string;
  listingTitle: string;
};

export function ReportListingModal({ listingId, listingTitle }: ReportListingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('Prohibited / Counterfeit Item');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await reportListing({ listingId, reason, details });
      if (res?.error) {
        setError(res.error);
      } else {
        setSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          setSubmitted(false);
          setDetails('');
        }, 2000);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full mt-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold py-2 px-4 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <span>🚩</span> Report this Listing
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>🚩</span> Report Listing
                </h3>
                <p className="text-xs text-slate-500 line-clamp-1">{listingTitle}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-center space-y-2">
                <div className="text-2xl">✓</div>
                <p className="text-sm font-bold">Report Submitted</p>
                <p className="text-xs text-emerald-600">
                  Thank you for helping keep E-merkato safe. Our admin team will review this item.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg font-medium border border-red-200">
                    ⚠️ {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Reason for Report
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-800 focus:border-red-600 focus:outline-none bg-white"
                  >
                    <option value="Prohibited / Counterfeit Item">Prohibited / Counterfeit Item</option>
                    <option value="Fraudulent or Suspicious Seller">Fraudulent or Suspicious Seller</option>
                    <option value="Inaccurate Price or Description">Inaccurate Price or Description</option>
                    <option value="Inappropriate Image / Content">Inappropriate Image / Content</option>
                    <option value="Already Sold / Unavailable">Already Sold / Unavailable</option>
                    <option value="Spam / Duplicate Listing">Spam / Duplicate Listing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-red-600 focus:outline-none"
                    placeholder="Provide any additional context for admin review..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50 shadow-xs"
                  >
                    {loading ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
