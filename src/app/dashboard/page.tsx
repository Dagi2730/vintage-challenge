import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Header } from '@/src/components/Header';
import { InfoModals } from '@/src/components/InfoModals';
import { AiAssistantWidget } from '@/src/components/AiAssistantWidget';
import { FilterBar } from '@/src/components/FilterBar';
import { getCategories } from '@/actions/categories';
import { searchListings } from '@/actions/listings';
import { formatCondition, formatPrice } from '@/lib/format';
import { Condition } from '@prisma/client';

type DashboardPageProps = {
  searchParams: {
    q?: string;
    category?: string;
    condition?: string;
    city?: string;
    neighborhood?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: 'newest' | 'price_asc' | 'price_desc';
  };
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth();

  const keyword = searchParams.q ?? '';
  const categorySlug = searchParams.category;
  const condition = searchParams.condition as Condition | undefined;
  const city = searchParams.city;
  const neighborhood = searchParams.neighborhood;
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;
  const sortBy = searchParams.sortBy ?? 'newest';

  const [categories, listingsResult] = await Promise.all([
    getCategories(),
    searchListings({
      keyword,
      categorySlug,
      condition,
      city,
      neighborhood,
      minPrice,
      maxPrice,
      sortBy,
      limit: 24,
    }),
  ]);

  const listings = listingsResult.data;
  const total = listingsResult.metadata.total;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-6">
        {/* Marketplace Search & Complete Filter Controls */}
        <FilterBar categories={categories} targetPath="/dashboard" />

        <div className="flex justify-between items-center pt-2">
          <h2 className="text-xl font-extrabold text-slate-900">
            {keyword
              ? `Showing ${total} items for "${keyword}"`
              : `Fresh Local Marketplace Items (${total})`}
          </h2>
          <span className="text-xs font-semibold text-slate-500 bg-slate-200/60 px-3 py-1 rounded-full">
            Active Listings
          </span>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 font-black text-2xl flex items-center justify-center mx-auto">
              📦
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">No items listed for sale yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Be the first to list an item on E-merkato! Upload real photos and start selling to local buyers in your city.
              </p>
            </div>
            <Link
              href="/sell"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-sm"
            >
              + Post New Item for Sale →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((item) => (
              <Link
                key={item.id}
                href={`/listings/${item.id}`}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group"
              >
                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                  <div className="grid grid-cols-2 gap-1 h-full">
                    {(item.photos.slice(0, 4) || []).map((photo: string, index: number) => (
                      <img key={`${item.id}-${index}`} src={photo} alt={item.title} className="w-full h-24 object-cover" />
                    ))}
                  </div>
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs">
                    {formatCondition(item.condition)}
                  </span>
                  {item.status === 'SOLD' && (
                    <span className="absolute top-3 right-3 bg-red-600 text-white text-[11px] font-black tracking-wider px-2.5 py-1 rounded-md shadow-md uppercase border border-red-700 z-10 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                      SOLD
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-1">{item.title}</h3>
                    <p className="text-lg font-bold text-slate-900">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      📍 {item.neighborhood}, {item.city}
                    </p>
                    <span className="text-[11px] font-semibold text-slate-600 border border-slate-200 px-2 py-1 rounded-full">
                      {item.photos.length} photos
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <InfoModals />
      <AiAssistantWidget />
    </div>
  );
}
