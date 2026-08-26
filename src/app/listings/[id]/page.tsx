import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Header } from '@/src/components/Header';
import { BuyButton } from '@/src/components/BuyButton';
import { DeleteListingButton } from '@/src/components/DeleteListingButton';
import { ReportListingModal } from '@/src/components/ReportListingModal';
import { getListingById } from '@/actions/listings';
import { getSellerReviews } from '@/actions/reviews';
import { auth } from '@/auth';
import { formatCondition, formatPrice } from '@/lib/format';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const listing = await getListingById(params.id);
  if (!listing) return { title: 'Listing Not Found | E-Merkato' };

  return {
    title: `${listing.title} | E-Merkato`,
    description: listing.description.substring(0, 160),
    openGraph: {
      title: listing.title,
      description: listing.description.substring(0, 160),
      images: listing.photos.length > 0 ? [listing.photos[0]] : [],
    }
  };
}

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

  const rawTelegram = (listing.seller as any)?.telegramHandle || '';
  const displayTelegram = rawTelegram ? (rawTelegram.startsWith('@') ? rawTelegram : `@${rawTelegram}`) : '';
  const cleanTelegram = rawTelegram.replace(/^@/, '');
  const telegramUrl = cleanTelegram ? `https://t.me/${cleanTelegram}` : '#';
  const sellerPhone = (listing.seller as any)?.phoneNumber || '';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-1">
        <div className="mb-6">
          <Link href="/explore" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
            ← Back to Explore Marketplace
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Gallery & Listing Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-slate-100 h-96 w-full flex items-center justify-center">
                {listing.photos.length > 0 ? (
                  <Image
                    src={listing.photos[0]}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-slate-400 text-sm">No photo available</span>
                )}
                {isSold && (
                  <span className="absolute top-4 right-4 bg-rose-600 text-white text-xs font-black tracking-wider px-3 py-1.5 rounded-lg shadow-md uppercase border border-rose-500 z-10 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                    SOLD
                  </span>
                )}
              </div>

              {listing.photos.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {listing.photos.map((photo: string, index: number) => (
                    <div
                      key={`${listing.id}-thumb-${index}`}
                      className="relative h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200"
                    >
                      <Image src={photo} alt="" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Item Description */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-slate-900">Item Description</h2>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{listing.description}</p>
            </div>
          </div>

          {/* Pricing, Action Buttons & Seller Card */}
          <div className="space-y-6">
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
                    {listing.category?.name ?? 'Marketplace Item'}
                  </span>
                  <h1 className="text-xl font-bold text-slate-900 line-clamp-2">{listing.title}</h1>
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

              <div className="mt-6 mb-8">
                <div className="text-3xl font-black text-slate-900">{formatPrice(listing.price)}</div>
                <div className="mt-2 text-sm text-slate-500 flex items-center gap-2">
                  <span>📍</span>
                  <span>{listing.neighborhood}, {listing.city}</span>
                </div>
              </div>

              <div className="space-y-3">
                <BuyButton
                  listingId={listing.id}
                  price={listing.price}
                  isLoggedIn={Boolean(session?.user)}
                  isOwner={isOwner}
                  isSold={isSold}
                />
                
                {displayTelegram ? (
                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-xl transition shadow-xs flex items-center justify-center gap-2 text-sm"
                  >
                    <span>💬</span> Chat on Telegram ({displayTelegram})
                  </a>
                ) : (
                  <div className="w-full bg-slate-100 text-slate-400 font-medium py-3 px-4 rounded-xl text-xs text-center border border-slate-200">
                    💬 Telegram handle not provided
                  </div>
                )}

                {sellerPhone ? (
                  <a
                    href={`tel:${sellerPhone}`}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl transition border border-slate-300 flex items-center justify-center gap-2 text-sm"
                  >
                    <span>📞</span> Call Seller ({sellerPhone})
                  </a>
                ) : (
                  <div className="w-full bg-slate-100 text-slate-400 font-medium py-3 px-4 rounded-xl text-xs text-center border border-slate-200">
                    📞 Phone number not provided
                  </div>
                )}

                <ReportListingModal listingId={listing.id} listingTitle={listing.title} />

                {(isOwner || session?.user?.role === 'ADMIN') && (
                  <DeleteListingButton listingId={listing.id} redirectAfterDelete={true} />
                )}
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

              {listing.seller?.verifiedStatus ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold py-2.5 px-3 rounded-xl mb-4 flex items-center gap-2">
                  <span>🛡️</span> Fayda National ID Verified Seller
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium py-2.5 px-3 rounded-xl mb-4 flex items-center gap-2">
                  <span>⚠️</span> Unverified Seller
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
