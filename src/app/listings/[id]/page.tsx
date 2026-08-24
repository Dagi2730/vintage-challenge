import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/src/components/Header';
import { BuyButton } from '@/src/components/BuyButton';
import { getListingById } from '@/actions/listings';
import { getSellerReviews } from '@/actions/reviews';
import { auth } from '@/auth';
import { formatCondition, formatPrice, formatRelativeDate } from '@/lib/format';

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [listing, session] = await Promise.all([
    getListingById(params.id),
    auth(),
  ]);

  if (!listing) {
    notFound();
  }

  const reviews = listing.seller?.id
    ? await getSellerReviews(listing.seller.id)
    : [];

  const isOwner = session?.user?.id === listing.sellerId;
  const isSold = listing.status === 'SOLD';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10 w-full">
        <div className="text-xs text-slate-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link href={`/explore?category=${listing.category?.slug ?? ''}`} className="hover:underline">
            {listing.category?.name ?? 'Category'}
          </Link>
          <span>/</span>
          <span className="text-slate-800">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="relative h-[420px] w-full overflow-hidden bg-slate-100">
                <img src={listing.photos[0]} alt={listing.title} className="w-full h-full object-cover" />
                {isSold && (
                  <span className="absolute top-4 right-4 bg-red-600 text-white text-xs font-black tracking-widest px-3.5 py-1.5 rounded-lg shadow-lg uppercase border border-red-700 flex items-center gap-1.5 z-20">
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                    SOLD
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2 p-3">
                {(listing.photos.slice(0, 4) || []).map((photo, index) => (
                  <img
                    key={`${listing.id}-${index}`}
                    src={photo}
                    alt={`${listing.title}-${index + 1}`}
                    className="h-24 w-full object-cover rounded-md border border-slate-200"
                  />
                ))}
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Description</h2>
              <p className="mt-3 text-sm text-slate-600 leading-6">{listing.description}</p>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-blue-600">
                    {formatCondition(listing.condition)}
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 mt-2">{listing.title}</h1>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                    isSold
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {listing.status}
                </span>
              </div>

              <div className="mt-6">
                <div className="text-3xl font-black text-slate-900">{formatPrice(listing.price)}</div>
                <div className="mt-1 text-sm text-slate-500 flex items-center gap-2">
                  <span>📍</span>
                  <span>{listing.neighborhood}, {listing.city}</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Listed {formatRelativeDate(new Date(listing.createdAt))}
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <BuyButton
                  listingId={listing.id}
                  price={listing.price}
                  isLoggedIn={Boolean(session?.user)}
                  isOwner={isOwner}
                  isSold={isSold}
                />
                <a
                  href="https://t.me/"
                  className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 rounded-lg transition text-center block text-sm"
                >
                  Chat on Telegram
                </a>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                About the Seller
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-sm font-bold text-blue-700">
                  {listing.seller?.name?.charAt(0).toUpperCase() ?? 'S'}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{listing.seller?.name ?? 'Seller'}</h4>
                  <p className="text-xs text-amber-500 font-medium flex items-center gap-1 mt-0.5">
                    ⭐ {listing.seller?.rating?.toFixed(1) ?? '0.0'}
                    <span className="text-slate-400 font-normal">({reviews.length} reviews)</span>
                  </p>
                </div>
              </div>

              {listing.seller?.verifiedStatus && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium py-2 px-3 rounded-lg mb-4 flex items-center gap-2">
                  🛡️ Verified with National ID
                </div>
              )}

              {reviews.length > 0 && (
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="text-xs">
                      <p className="font-semibold text-slate-800">
                        {review.reviewer.name} · {'⭐'.repeat(review.rating)}
                      </p>
                      {review.comment && <p className="text-slate-500 mt-1">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
