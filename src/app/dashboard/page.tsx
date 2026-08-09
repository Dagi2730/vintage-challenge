import Link from 'next/link';

export default function ListingDetailPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="text-xl font-bold text-blue-600">ReMarket</Link>
        <Link href="/sell" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition">Sell</Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        <div className="text-xs text-slate-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:underline">Home</Link> / 
          <Link href="/explore?category=electronics" className="hover:underline">Electronics</Link> / 
          <span className="text-slate-800">Vintage Cameras</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden p-4">
              <div className="h-[380px] bg-slate-100 rounded-lg mb-4 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32" alt="Product" className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:border-blue-500">
                    <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32" alt="Thumb" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Detailed Item Description</h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Beautiful vintage 35mm film camera, meticulously maintained and in perfect working order. The light meter is accurate, shutter speeds are crisp, and the lens is completely free of fungus or scratches.
              </p>
              <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
                <li>Includes original leather half-case and strap</li>
                <li>Recently CLA'd (Cleaned, Lubricated, Adjusted) last month</li>
                <li>Body cap and lens cap included</li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded">Condition: Fair</span>
                <span className="text-xs text-slate-400">Listed 2 days ago</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">Leica M3 Single Stroke Vintage Camera</h1>
              <p className="text-3xl font-extrabold text-blue-600 mb-4">$150 <span className="text-xs font-normal text-slate-500">(~8,700 ETB)</span></p>
              <p className="text-xs text-slate-500 mb-6 flex items-center gap-1">📍 Addis Ababa, Bole</p>

              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition shadow-sm flex items-center justify-center gap-2 text-sm">
                  💳 Buy with Chapa
                </button>
                <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2 text-sm">
                  💬 Chat on Telegram
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">About the Seller</h3>
              <div className="flex items-center gap-3 mb-4">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb" alt="Seller" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Alex Johnson</h4>
                  <p className="text-xs text-amber-500 font-medium flex items-center gap-1 mt-0.5">⭐ 4.9 <span className="text-slate-400 font-normal">(12 reviews)</span></p>
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium py-2 px-3 rounded-lg mb-4 flex items-center gap-2">
                🛡️ Verified with National ID
              </div>
              <button className="w-full text-center text-xs text-slate-500 hover:text-red-600 transition font-medium">
                ⚠️ Report Listing
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}