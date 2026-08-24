import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Header } from '@/src/components/Header';
import { ReviewForm } from '@/src/components/ReviewForm';
import { getUserListings } from '@/actions/listings';
import { getUserTransactions } from '@/actions/transactions';
import { getReviewableTransactions } from '@/actions/reviews';
import { formatCondition, formatPrice } from '@/lib/format';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = session.user.id;

  const [listings, transactions, reviewable] = await Promise.all([
    getUserListings(userId),
    getUserTransactions(userId),
    getReviewableTransactions(userId),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-1 space-y-10">
        <section>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {session.user.name}</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your listings, purchases, and reviews.</p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">Active Listings</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {listings.filter((listing) => listing.status === 'ACTIVE').length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">Purchases</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{transactions.purchases.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">Sales</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{transactions.sales.length}</p>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">My Listings</h2>
            <Link href="/sell" className="text-sm text-blue-600 font-medium hover:underline">
              Create listing
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              You have not posted any listings yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-md transition flex flex-col"
                >
                  <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
                    <img src={listing.photos[0]} alt={listing.title} className="h-full w-full object-cover" />
                    {listing.status === 'SOLD' && (
                      <span className="absolute top-3 right-3 bg-rose-600 text-white text-[11px] font-black tracking-wider px-2.5 py-1 rounded-md shadow-sm uppercase border border-rose-500 z-10 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        SOLD
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-slate-900 line-clamp-1">{listing.title}</p>
                    <p className="text-sm font-bold text-slate-800 mt-1">{formatPrice(listing.price)}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {formatCondition(listing.condition)} · {listing.status}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">My Purchases</h2>
            {transactions.purchases.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                No purchases yet.
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.purchases.map((transaction) => (
                  <div key={transaction.id} className="rounded-xl border border-slate-200 bg-white p-4 flex gap-4">
                    <img
                      src={transaction.listing.photos[0]}
                      alt={transaction.listing.title}
                      className="h-16 w-16 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{transaction.listing.title}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Seller: {transaction.seller.name} · {formatPrice(transaction.amount)}
                      </p>
                      <p className="text-xs mt-1 font-medium text-blue-600">{transaction.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">My Sales</h2>
            {transactions.sales.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                No sales yet.
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.sales.map((transaction) => (
                  <div key={transaction.id} className="rounded-xl border border-slate-200 bg-white p-4 flex gap-4">
                    <img
                      src={transaction.listing.photos[0]}
                      alt={transaction.listing.title}
                      className="h-16 w-16 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{transaction.listing.title}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Buyer: {transaction.buyer.name} · {formatPrice(transaction.amount)}
                      </p>
                      <p className="text-xs mt-1 font-medium text-emerald-600">{transaction.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {reviewable.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Leave a Review</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviewable.map((transaction) => (
                <ReviewForm
                  key={transaction.id}
                  transactionId={transaction.id}
                  sellerName={transaction.seller.name}
                  listingTitle={transaction.listing.title}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
