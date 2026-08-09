import Link from 'next/link';

const CATEGORIES = [
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Furniture', slug: 'furniture' },
  { name: 'Vehicles', slug: 'vehicles' },
  { name: 'Apparel', slug: 'apparel' },
];

const SAMPLE_LISTINGS = [
  {
    id: '1',
    title: 'Vintage Film Camera',
    price: 120,
    condition: 'Lightly Used',
    location: 'Bole, Addis Ababa',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32',
  },
  {
    id: '2',
    title: 'Modern Grey Sofa',
    price: 450,
    condition: 'Like New',
    location: 'Kazanchis, Addis Ababa',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc',
  },
  {
    id: '3',
    title: 'Matte Electric Guitar',
    price: 300,
    condition: 'Fair',
    location: 'Piassa, Addis Ababa',
    image: 'https://images.unsplash.com/photo-1510915361894-db8b6010cb5a',
  },
  {
    id: '4',
    title: 'Premium Denim Bundle',
    price: 65,
    condition: 'Lightly Used',
    location: 'CMC, Addis Ababa',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="text-xl font-bold text-blue-600 tracking-tight">
          ReMarket
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/sell" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow-sm">
            Sell
          </Link>
          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      <section className="bg-slate-100 py-16 px-6 text-center border-b border-slate-200">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Find your next treasure
        </h1>
        <div className="max-w-xl mx-auto relative mb-6">
          <input
            type="text"
            placeholder="Search for items..."
            className="w-full bg-white border border-slate-300 rounded-full py-3.5 pl-12 pr-4 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <svg className="w-5 h-5 text-slate-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((cat) => (
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {SAMPLE_LISTINGS.map((item) => (
            <Link key={item.id} href={`/listings/${item.id}`} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group">
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs">
                  {item.condition}
                </span>
              </div>
              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1 line-clamp-1">{item.title}</h3>
                  <p className="text-lg font-bold text-slate-900">${item.price}</p>
                </div>
                <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                  📍 {item.location}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 px-6 text-sm text-slate-500 flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto w-full">
        <span className="font-semibold text-slate-800">ReMarket</span>
        <div className="flex gap-6 mt-4 sm:mt-0">
          <span className="hover:text-slate-800 cursor-pointer">Trust & Safety</span>
          <span className="hover:text-slate-800 cursor-pointer">Support</span>
          <span className="hover:text-slate-800 cursor-pointer">About Us</span>
          <span className="hover:text-slate-800 cursor-pointer">Privacy Policy</span>
        </div>
        <span className="mt-4 sm:mt-0 text-xs">© 2026 ReMarket Inc. All rights reserved.</span>
      </footer>
    </div>
  );
}