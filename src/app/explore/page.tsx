import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Header } from '@/src/components/Header';
import { getCategories } from '@/actions/categories';
import { searchListings } from '@/actions/listings';
import { formatCondition, formatPrice } from '@/lib/format';
import { Condition } from '@prisma/client';

const neighborhoods = ['Bole', 'Kazanchis', 'Piassa', 'CMC'];

type ExplorePageProps = {
  searchParams: {
    q?: string;
    category?: string;
    condition?: string;
    neighborhood?: string;
    minPrice?: string;
    maxPrice?: string;
  };
};

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const session = await auth();
  if (session?.user?.role === 'ADMIN') {
    redirect('/admin');
  }

  const keyword = searchParams.q ?? '';
  const categorySlug = searchParams.category;
  const condition = searchParams.condition as Condition | undefined;
  const neighborhood = searchParams.neighborhood;
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined;

  const [categories, results] = await Promise.all([
    getCategories(),
    searchListings({
      keyword,
      categorySlug,
      condition,
      neighborhood,
      minPrice,
      maxPrice,
      limit: 24,
    }),
  ]);

  const listings = results.data;
  const total = results.metadata.total;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header showSearch searchValue={keyword} />

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8 w-full flex-1">
        <aside className="w-64 space-y-6 hidden md:block">
          <form action="/explore" method="get" className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Filters</h3>
              <Link href="/explore" className="text-xs text-blue-600 hover:underline">
                Clear All
              </Link>
            </div>

            <input type="hidden" name="q" value={keyword} />

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">Category</label>
              <select
                name="category"
                defaultValue={categorySlug ?? ''}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-700"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">Condition</label>
              <select
                name="condition"
                defaultValue={condition ?? ''}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-700"
              >
                <option value="">Any condition</option>
                <option value="BRAND_NEW">Brand New</option>
                <option value="LIKE_NEW">Like New</option>
                <option value="LIGHTLY_USED">Lightly Used</option>
                <option value="FAIR">Fair</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2">Location</label>
              <select
                name="neighborhood"
                defaultValue={neighborhood ?? ''}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-700"
              >
                <option value="">Addis Ababa (All)</option>
                {neighborhoods.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Min ETB</label>
                <input
                  type="number"
                  name="minPrice"
                  defaultValue={minPrice ?? ''}
                  className="w-full rounded-lg border border-slate-300 px-2 py-2 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Max ETB</label>
                <input
                  type="number"
                  name="maxPrice"
                  defaultValue={maxPrice ?? ''}
                  className="w-full rounded-lg border border-slate-300 px-2 py-2 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </form>
        </aside>

        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-slate-900">
              {keyword
                ? `Showing ${total} results for "${keyword}"`
                : `Showing ${total} local listings`}
            </h1>
          </div>

          {listings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              No listings match your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((item) => (
                <Link
                  key={item.id}
                  href={`/listings/${item.id}`}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group"
                >
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={item.photos[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs">
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
        </main>
      </div>
    </div>
  );
}
