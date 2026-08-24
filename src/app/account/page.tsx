import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Header } from '@/src/components/Header';
import { ReviewForm } from '@/src/components/ReviewForm';
import { EditProfileModal } from '@/src/components/EditProfileModal';
import { getUserListings } from '@/actions/listings';
import { getUserTransactions } from '@/actions/transactions';
import { getReviewableTransactions } from '@/actions/reviews';
import { getUserProfile } from '@/actions/user';
import { formatCondition, formatPrice } from '@/lib/format';

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const userId = session.user.id;

  const [profile, listings, transactions, reviewable] = await Promise.all([
    getUserProfile(userId),
    getUserListings(userId),
    getUserTransactions(userId),
    getReviewableTransactions(userId),
  ]);

  const name = profile?.name ?? session.user.name ?? 'User';
  const email = profile?.email ?? session.user.email ?? 'user@example.com';
  const phone = profile?.phoneNumber ?? '+251 91 123 4567';
  const telegram = profile?.telegramHandle ?? '@' + name.toLowerCase().replace(/\s+/g, '');
  const isVerified = profile?.verifiedStatus ?? false;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-1 space-y-8">
        {/* Profile & Account Details Header */}
        <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-black text-2xl flex items-center justify-center border-2 border-blue-500 shadow-sm">
                {name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                  {name}
                  {isVerified ? (
                    <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      🛡️ Verified
                    </span>
                  ) : (
                    <span className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      ⚠️ Unverified
                    </span>
                  )}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">Personal Account Settings & Activity</p>
              </div>
            </div>

            <EditProfileModal
              initialName={name}
              initialPhone={phone}
              initialTelegram={telegram}
            />
          </div>

          {/* Account Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">Full Name</span>
              <p className="text-sm font-bold text-slate-900">{name}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">Email Address</span>
              <p className="text-sm font-bold text-slate-900 truncate">{email}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">Phone Number</span>
              <p className="text-sm font-bold text-slate-900">{phone}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">Telegram Account</span>
              <p className="text-sm font-bold text-blue-600">{telegram}</p>
            </div>
          </div>
        </section>

        {/* National ID Verification Banner / Placeholder */}
        <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🪪</span>
              <h2 className="text-lg font-bold">National ID Verification</h2>
            </div>
            <p className="text-xs text-blue-200 max-w-xl">
              Verify your Ethiopian National ID (Fayda) to get a trusted badge, unlock higher selling limits, and build trust with buyers.
            </p>
          </div>
          <button
            type="button"
            className="bg-white text-blue-900 font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-blue-50 transition shadow-sm whitespace-nowrap cursor-pointer"
          >
            {isVerified ? 'View ID Status' : 'Start ID Verification →'}
          </button>
        </section>

        {/* Activity Stats Counters */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
            <p className="text-xs uppercase font-bold tracking-wide text-slate-400">Active Listings</p>
            <p className="text-2xl font-black text-slate-900 mt-2">
              {listings.filter((listing) => listing.status === 'ACTIVE').length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
            <p className="text-xs uppercase font-bold tracking-wide text-slate-400">Purchases</p>
            <p className="text-2xl font-black text-slate-900 mt-2">{transactions.purchases.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
            <p className="text-xs uppercase font-bold tracking-wide text-slate-400">Sales</p>
            <p className="text-2xl font-black text-slate-900 mt-2">{transactions.sales.length}</p>
          </div>
        </section>

        {/* My Listings */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">My Listings</h2>
              <p className="text-xs text-slate-500">Items you have posted for sale</p>
            </div>
            <Link
              href="/sell"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-xs"
            >
              + Create Listing
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-xs text-slate-500">
              You have not posted any listings yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-md transition flex flex-col group"
                >
                  <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
                    <img src={listing.photos[0]} alt={listing.title} className="h-full w-full object-cover group-hover:scale-105 transition" />
                    {listing.status === 'SOLD' && (
                      <span className="absolute top-3 right-3 bg-red-600 text-white text-[11px] font-black tracking-wider px-2.5 py-1 rounded-md shadow-md uppercase border border-red-700 z-10 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        SOLD
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-bold text-slate-900 line-clamp-1">{listing.title}</p>
                    <p className="text-sm font-extrabold text-slate-800 mt-1">{formatPrice(listing.price)}</p>
                    <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
                      <span>{formatCondition(listing.condition)}</span>
                      <span className={`font-semibold px-2 py-0.5 rounded text-[10px] ${listing.status === 'SOLD' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {listing.status}
                      </span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Purchases & Sales Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">My Purchases</h2>
            {transactions.purchases.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-xs text-slate-500">
                No purchases yet.
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.purchases.map((transaction) => (
                  <div key={transaction.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex gap-4">
                    <img
                      src={transaction.listing.photos[0]}
                      alt={transaction.listing.title}
                      className="h-16 w-16 rounded-lg object-cover border border-slate-200"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">{transaction.listing.title}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Seller: {transaction.seller.name} · {formatPrice(transaction.amount)}
                      </p>
                      <p className="text-xs mt-1 font-semibold text-emerald-600">Completed</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">My Sales</h2>
            {transactions.sales.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-xs text-slate-500">
                No sales yet.
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.sales.map((transaction) => (
                  <div key={transaction.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex gap-4">
                    <img
                      src={transaction.listing.photos[0]}
                      alt={transaction.listing.title}
                      className="h-16 w-16 rounded-lg object-cover border border-slate-200"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900">{transaction.listing.title}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Buyer: {transaction.buyer.name} · {formatPrice(transaction.amount)}
                      </p>
                      <p className="text-xs mt-1 font-semibold text-emerald-600">Completed</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {reviewable.length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
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
