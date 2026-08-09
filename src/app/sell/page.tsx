'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function SellPage() {
  const [condition, setCondition] = useState('LIGHTLY_USED');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600">ReMarket Seller</Link>
        <span className="text-sm font-medium text-slate-600">Create New Listing</span>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 w-full flex-1">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Create New Listing</h1>
          <p className="text-sm text-slate-500 mb-8">Provide detailed information to help buyers find your item.</p>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">1. Visuals</label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 transition cursor-pointer bg-slate-50">
                <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-400 mt-1">Upload up to 5 photos. JPG, PNG (Max 5MB)</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-900">2. Details</label>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Item Title</label>
                <input type="text" placeholder="e.g., Vintage Leather Jacket" className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Detailed Description</label>
                <textarea rows={4} placeholder="Describe the item's features, brand, history..." className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-900">3. Categorization</label>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                <select className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  <option>Select a category</option>
                  <option>Electronics</option>
                  <option>Furniture</option>
                  <option>Vehicles</option>
                  <option>Apparel</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Condition Status</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['BRAND_NEW', 'LIKE_NEW', 'LIGHTLY_USED', 'FAIR'].map((cond) => (
                    <button
                      type="button"
                      key={cond}
                      onClick={() => setCondition(cond)}
                      className={`py-2.5 px-3 text-xs font-medium rounded-lg border transition ${condition === cond ? 'bg-blue-50 border-blue-600 text-blue-600' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                    >
                      {cond.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-900">4. Logistics</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Price (ETB)</label>
                  <input type="number" placeholder="0.00" className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Neighborhood / City</label>
                  <input type="text" placeholder="e.g., Bole, Addis Ababa" className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition shadow-sm">
              Publish Listing
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}