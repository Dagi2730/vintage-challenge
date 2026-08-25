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
  const [isOpen, setIsOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CHAPA' | 'TELEBIRR'>('CHAPA');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
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
        setMessage(`Payment successful via ${paymentMethod === 'CHAPA' ? 'Chapa' : 'Telebirr'}! Seller notified.`);
        setTimeout(() => {
          setIsOpen(false);
          router.refresh();
        }, 1500);
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
      <div className="space-y-2">
        <button
          type="button"
          disabled
          className="w-full bg-slate-100 border border-slate-200 text-slate-500 font-bold py-3 rounded-xl text-sm text-center tracking-wide uppercase cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          Item Sold
        </button>
      </div>
    );
  }

  if (isOwner) {
    return (
      <button
        type="button"
        disabled
        className="w-full bg-slate-100 border border-slate-200 text-slate-400 font-medium py-3 rounded-xl text-sm cursor-not-allowed"
      >
        This is your listing
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (!isLoggedIn) {
            router.push('/login');
          } else {
            setIsOpen(true);
          }
        }}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
      >
        💳 Buy Now · {price.toLocaleString()} ETB
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>🛍️</span> Secure Payment Checkout
                </h3>
                <p className="text-xs text-slate-500">Select your preferred Ethiopian payment gateway</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {message ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-center space-y-2">
                <div className="text-3xl">🎉</div>
                <p className="text-sm font-bold">{message}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg font-medium border border-red-200">
                    ⚠️ {error}
                  </div>
                )}

                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Select Payment Gateway
                  </label>

                  <div
                    onClick={() => setPaymentMethod('CHAPA')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-center justify-between ${
                      paymentMethod === 'CHAPA'
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                        CH
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Chapa Ethiopia</p>
                        <p className="text-xs text-slate-500">Debit / Credit Card & Mobile Banking</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-600">
                      {paymentMethod === 'CHAPA' ? '✓ Selected' : ''}
                    </span>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('TELEBIRR')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-center justify-between ${
                      paymentMethod === 'TELEBIRR'
                        ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                        tb
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Telebirr Mobile Money</p>
                        <p className="text-xs text-slate-500">Ethio Telecom Quick Checkout</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-600">
                      {paymentMethod === 'TELEBIRR' ? '✓ Selected' : ''}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs text-slate-600 flex justify-between items-center">
                  <span>Total Payable Amount:</span>
                  <span className="text-base font-extrabold text-slate-900">{price.toLocaleString()} ETB</span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 shadow-xs flex items-center gap-2"
                  >
                    {loading ? (
                      <span>Processing...</span>
                    ) : (
                      `Confirm & Pay with ${paymentMethod === 'CHAPA' ? 'Chapa' : 'Telebirr'}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
