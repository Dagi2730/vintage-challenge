import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Header } from '@/src/components/Header';
import { getCategories } from '@/actions/categories';
import { searchListings } from '@/actions/listings';
import { formatCondition, formatPrice } from '@/lib/format';

export default async function Home() {
  const session = await auth();
  if (session?.user?.role === 'ADMIN') {
    redirect('/admin');
  }

  const [categories, listingsResult] = await Promise.all([
    getCategories(),
    searchListings({ limit: 4 }),
  ]);

  const listings = listingsResult?.data || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <section className="bg-slate-100 py-16 px-6 text-center border-b border-slate-200">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Find your next treasure
        </h1>
        <form action="/explore" method="get" className="max-w-xl mx-auto relative mb-6">
          <input
            type="text"
            name="q"
            placeholder="Search for items..."
            className="w-full bg-white border border-slate-300 rounded-full py-3.5 pl-12 pr-4 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <svg className="w-5 h-5 text-slate-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </form>

        <div className="flex flex-wrap justify-center gap-3">
          {(categories || []).map((cat) => (
            <Link
              key={cat.slug}
              href={`/explore?category=${cat.slug}`}
              className="bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200 px-5 py-2 rounded-full text-sm font-medium transition shadow-sm"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Fresh Local Listings</h2>
          <Link href="/explore" className="text-blue-600 font-medium text-sm hover:underline">
            See all
          </Link>
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
            {listings.map((item) => {
              // Safely parse or default photos array
              const photosArray = Array.isArray(item.photos) ? item.photos : [];

              return (
                <Link
                  key={item.id}
                  href={`/listings/${item.id}`}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group"
                >
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <div className="grid grid-cols-2 gap-1 h-full">
                      {photosArray.slice(0, 4).map((photo: string, index: number) => (
                        <img key={`${item.id}-${index}`} src={photo} alt={item.title} className="w-full h-24 object-cover" />
                      ))}
                    </div>
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
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        📍 {item.neighborhood}, {item.city}
                      </p>
                      <span className="text-[11px] font-semibold text-slate-600 border border-slate-200 px-2 py-1 rounded-full">
                        {photosArray.length} photos
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 px-6 text-sm text-slate-500 flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto w-full">
        <span className="font-semibold text-slate-800">E-merkato</span>
        <div className="flex gap-6 mt-4 sm:mt-0">
          <span className="hover:text-slate-800 cursor-pointer">Trust & Safety</span>
          <span className="hover:text-slate-800 cursor-pointer">Support</span>
          <span className="hover:text-slate-800 cursor-pointer">About Us</span>
          <span className="hover:text-slate-800 cursor-pointer">Privacy Policy</span>
        </div>
        <span className="mt-4 sm:mt-0 text-xs">© 2026 E-merkato Inc. All rights reserved.</span>
      </footer>
    </div>
  );
}