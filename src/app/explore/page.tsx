import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Header } from '@/src/components/Header';
import { Footer } from '@/src/components/Footer';
import { FilterBar } from '@/src/components/FilterBar';
import { getCategories } from '@/actions/categories';
import { searchListings } from '@/actions/listings';
import { formatCondition, formatPrice } from '@/lib/format';
import { Condition } from '@prisma/client';

type ExplorePageProps = {
  searchParams: {
    q?: string;
    category?: string;
    condition?: string;
    city?: string;
    neighborhood?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: 'newest' | 'price_asc' | 'price_desc';
    page?: string;
  };
};

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const session = await auth();

  const keyword = searchParams.q ?? '';
  const categorySlug = searchParams.category;
  const condition = searchParams.condition as Condition | undefined;
  const city = searchParams.city;
  const neighborhood = searchParams.neighborhood;
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;
  const sortBy = searchParams.sortBy ?? 'newest';
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;

  const [categories, results] = await Promise.all([
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
      page,
      limit: 24,
    }),
  ]);

  const listings = results.data;
  const total = results.metadata.total;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 space-y-6">
        {/* Full Filtering Controls */}
        <FilterBar categories={categories} targetPath="/explore" />

        <div className="flex justify-between items-center pt-2">
          <h1 className="text-xl font-extrabold text-slate-900">
            {keyword
              ? `Showing ${total} results for "${keyword}"`
              : `Explore Ethiopian Marketplace (${total} items)`}
          </h1>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 space-y-3">
            <div className="text-3xl">🔍</div>
            <p className="text-base font-bold text-slate-800">No listings match your current filters</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your price range, city, condition, or clear filters to discover more items.
            </p>
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
                  <Image
                    src={item.photos[0]}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs z-10">
                    {formatCondition(item.condition)}
                  </span>
                  {item.status === 'SOLD' && (
                    <span className="absolute top-3 right-3 bg-rose-600 text-white text-[11px] font-black tracking-wider px-2.5 py-1 rounded-md shadow-sm uppercase border border-rose-500 z-10 flex items-center gap-1">
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
                  <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                    📍 {item.neighborhood}, {item.city}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* Pagination Controls */}
        {results.metadata.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            {results.metadata.page > 1 && (
              <Link
                href={`/explore?${new URLSearchParams({
                  ...searchParams,
                  page: String(results.metadata.page - 1)
                }).toString()}`}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
              >
                Previous
              </Link>
            )}
            <span className="text-sm font-medium text-slate-700 px-4">
              Page {results.metadata.page} of {results.metadata.totalPages}
            </span>
            {results.metadata.page < results.metadata.totalPages && (
              <Link
                href={`/explore?${new URLSearchParams({
                  ...searchParams,
                  page: String(results.metadata.page + 1)
                }).toString()}`}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
