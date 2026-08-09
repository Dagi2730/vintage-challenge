import Link from 'next/link';

const SEARCH_RESULTS = [
  {
    id: '1',
    title: 'MacBook Pro 14" M1 Pro (2021) - 16GB RAM, 512...',
    price: 1250,
    condition: 'Like New',
    location: 'Bole, Addis Ababa',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
  },
  {
    id: '2',
    title: 'Dell XPS 13 9310 - Intel i7, 16GB, 4K Touch',
    price: 850,
    condition: 'Lightly Used',
    location: 'Kazanchis, Addis Ababa',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45',
  },
  {
    id: '3',
    title: 'Lenovo ThinkPad X1 Carbon Gen 9 (Sealed...)',
    price: 1400,
    condition: 'New',
    location: 'Piassa, Addis Ababa',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed',
  },
];

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="text-xl font-bold text-blue-600">ReMarket</Link>
        <div className="flex items-center gap-6">
          <div className="relative w-72">
            <input type="text" defaultValue="Laptops" className="w-full bg-slate-100 border border-slate-300 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
          </div>
          <Link href="/sell" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition">Sell</Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8 w-full flex-1">
        {/* Filters Sidebar */}
        <aside className="w-64 space-y-6 hidden md:block">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Filters</h3>
              <button className="text-xs text-blue-600 hover:underline">Clear All</button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">Price Range</label>
                <input type="range" className="w-full accent-blue-600" />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>$0</span>
                  <span>$2,000+</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">Condition</label>
                <div className="space-y-2 text-sm text-slate-600">
                  {['New', 'Like New', 'Lightly Used', 'Fair'].map((cond) => (
                    <label key={cond} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked={cond !== 'New'} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      {cond}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">Location</label>
                <select className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-700">
                  <option>Addis Ababa (All)</option>
                  <option>Bole</option>
                  <option>Kazanchis</option>
                  <option>Piassa</option>
                </select>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-slate-900">Showing 24 results for 'Laptops'</h1>
            <select className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-700">
              <option>Sort by: Most Relevant</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SEARCH_RESULTS.map((item) => (
              <Link key={item.id} href={`/listings/${item.id}`} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group">
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
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
      </div>
    </div>
  );
}