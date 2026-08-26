'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

type FilterBarProps = {
  categories: Array<{ id: string; name: string; slug: string }>;
  targetPath?: string;
};

import { CITIES, getNeighborhoodsForCity } from '@/src/lib/location-data';

export function FilterBar({ categories, targetPath = '/explore' }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [condition, setCondition] = useState(searchParams.get('condition') ?? '');
  const [city, setCity] = useState(searchParams.get('city') ?? '');
  const [neighborhood, setNeighborhood] = useState(searchParams.get('neighborhood') ?? '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') ?? 'newest');

  const availableNeighborhoods = getNeighborhoodsForCity(city);

  const applyFilters = (overrides?: Record<string, string>) => {
    const params = new URLSearchParams();

    const currentFilters = {
      q,
      category,
      condition,
      city,
      neighborhood,
      minPrice,
      maxPrice,
      sortBy,
      ...overrides,
    };

    Object.entries(currentFilters).forEach(([key, val]) => {
      if (val && val.trim() !== '') {
        params.set(key, val.trim());
      }
    });

    router.push(`${targetPath}?${params.toString()}`);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (q !== (searchParams.get('q') ?? '')) {
        applyFilters({ q });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [q, searchParams]);

  const handleReset = () => {
    setQ('');
    setCategory('');
    setCondition('');
    setCity('');
    setNeighborhood('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    router.push(targetPath);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 w-full">
      {/* Search Hero Input & Quick Sort Row */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between pb-3 border-b border-slate-100">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            placeholder="Search items by keyword (e.g., iPhone, Sofa, Toyota)..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute left-3.5 top-3 text-slate-400">🔍</span>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              applyFilters({ sortBy: e.target.value });
            }}
            className="bg-slate-50 border border-slate-300 rounded-xl py-2.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto cursor-pointer"
          >
            <option value="newest">⚡ Sort: Newest First</option>
            <option value="price_asc">🏷️ Price: Low to High</option>
            <option value="price_desc">💎 Price: High to Low</option>
            <option value="location">📍 Location (A-Z)</option>
          </select>

          <button
            type="button"
            onClick={() => applyFilters()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap cursor-pointer"
          >
            Filter Results
          </button>
        </div>
      </div>

      {/* Filter Dropdowns Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* City Filter */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            📍 City
          </label>
          <select
            value={city}
            onChange={(e) => {
              const newCity = e.target.value;
              setCity(newCity);
              setNeighborhood('');
              applyFilters({ city: newCity, neighborhood: '' });
            }}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="">All Cities</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Neighborhood / Subcity Filter */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            🏙️ Area / Subcity
          </label>
          <select
            value={neighborhood}
            onChange={(e) => {
              const newNeigh = e.target.value;
              setNeighborhood(newNeigh);
              applyFilters({ neighborhood: newNeigh });
            }}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="">All Areas</option>
            {availableNeighborhoods.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            📦 Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Condition Filter (New vs Used) */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            ✨ Condition (New/Used)
          </label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="">All Conditions</option>
            <option value="BRAND_NEW">Brand New</option>
            <option value="LIKE_NEW">Like New (Used)</option>
            <option value="LIGHTLY_USED">Lightly Used</option>
            <option value="FAIR">Fair Condition</option>
          </select>
        </div>

        {/* Min Price */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            💰 Min Price (ETB)
          </label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min ETB"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-medium text-slate-800 focus:outline-none"
          />
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            💰 Max Price (ETB)
          </label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max ETB"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-medium text-slate-800 focus:outline-none"
          />
        </div>
      </div>

      {/* Quick Pills & Reset Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-semibold">Quick Filter:</span>
          <button
            type="button"
            onClick={() => {
              setCondition('BRAND_NEW');
              applyFilters({ condition: 'BRAND_NEW' });
            }}
            className={`px-3 py-1 rounded-full border text-[11px] font-bold transition cursor-pointer ${
              condition === 'BRAND_NEW'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            ✨ Brand New Only
          </button>
          <button
            type="button"
            onClick={() => {
              setCondition('LIKE_NEW');
              applyFilters({ condition: 'LIKE_NEW' });
            }}
            className={`px-3 py-1 rounded-full border text-[11px] font-bold transition cursor-pointer ${
              condition === 'LIKE_NEW'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            📦 Used / Like New
          </button>
          <button
            type="button"
            onClick={() => {
              setCity('Addis Ababa');
              applyFilters({ city: 'Addis Ababa' });
            }}
            className={`px-3 py-1 rounded-full border text-[11px] font-bold transition cursor-pointer ${
              city === 'Addis Ababa'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            📍 Addis Ababa Only
          </button>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-slate-400 hover:text-red-600 font-semibold transition flex items-center gap-1 cursor-pointer"
        >
          <span>✕</span> Clear All Filters
        </button>
      </div>
    </div>
  );
}
