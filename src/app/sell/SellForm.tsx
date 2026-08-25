'use client';

import { useState } from 'react';
import { createListing } from '@/actions/listings';
import type { Category } from '@/src/types';
import { CITIES, getNeighborhoodsForCity } from '@/src/lib/location-data';

const conditionOptions = ['BRAND_NEW', 'LIKE_NEW', 'LIGHTLY_USED', 'FAIR'] as const;
type ConditionValue = (typeof conditionOptions)[number];

const photoPool = [
  'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80',
];

type SellFormProps = {
  categories: Category[];
};

export function SellForm({ categories }: SellFormProps) {
  const [condition, setCondition] = useState<ConditionValue>('LIGHTLY_USED');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [city, setCity] = useState('Addis Ababa');
  const [neighborhood, setNeighborhood] = useState('Bole');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const availableNeighborhoods = getNeighborhoodsForCity(city);

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length > 5) {
      setError('You can upload between 3 and 5 photos only.');
      return;
    }

    if (files.length < 3) {
      setError('Please add at least 3 photos to publish a listing.');
      return;
    }

    const previews = files.slice(0, 5).map((file) => URL.createObjectURL(file));
    setSelectedImages(previews);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData(event.currentTarget);

    const photos = selectedImages.length > 0
      ? selectedImages.map((_, index) => photoPool[index % photoPool.length])
      : photoPool.slice(0, 3);

    if (photos.length < 3 || photos.length > 5) {
      setError('A listing must include between 3 and 5 photos.');
      setLoading(false);
      return;
    }

    const payload = {
      title: String(formData.get('title') ?? ''),
      description: String(formData.get('description') ?? ''),
      price: Number(formData.get('price') ?? 0),
      condition,
      city: String(formData.get('city') ?? ''),
      neighborhood: String(formData.get('neighborhood') ?? ''),
      categoryId: String(formData.get('category') ?? ''),
      photos,
    };

    try {
      const result = await createListing(payload);
      if (result?.success) {
        setMessage('Listing published successfully.');
        setSelectedImages([]);
        event.currentTarget.reset();
      } else {
        setError('Unable to publish listing.');
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to publish listing.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">1. Visuals</label>
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 transition cursor-pointer bg-slate-50">
          <label className="block cursor-pointer">
            <span className="text-sm font-medium text-slate-700">Click to upload or drag and drop</span>
            <span className="text-xs text-slate-400 mt-1 block">Upload 3 to 5 photos. JPG, PNG (Max 5MB)</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
          </label>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {selectedImages.length > 0 && selectedImages.slice(0, 5).map((image, index) => (
              <img key={`${image}-${index}`} src={image} alt="preview" className="h-16 w-16 rounded object-cover border border-slate-300" />
            ))}
          </div>
          <p className="mt-3 text-xs font-semibold text-slate-500">{selectedImages.length} / 5 selected photos</p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-semibold text-slate-900">2. Details</label>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Item Title</label>
          <input name="title" type="text" required placeholder="e.g., Vintage Leather Jacket" className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Detailed Description</label>
          <textarea name="description" required rows={4} placeholder="Describe the item's features, brand, history..." className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-semibold text-slate-900">3. Categorization</label>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
          <select name="category" required className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">Condition Status</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {conditionOptions.map((cond) => (
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Price (ETB)</label>
            <input name="price" type="number" min="1" required placeholder="0.00" className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">City</label>
            <select
              name="city"
              value={city}
              onChange={(e) => {
                const newCity = e.target.value;
                setCity(newCity);
                const nextNeighs = getNeighborhoodsForCity(newCity);
                setNeighborhood(nextNeighs[0] ?? '');
              }}
              required
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Subcity / Area</label>
            <select
              name="neighborhood"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              required
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {availableNeighborhoods.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      {message && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">{message}</div>}

      <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition shadow-sm disabled:opacity-60">
        {loading ? 'Publishing...' : 'Publish Listing'}
      </button>
    </form>
  );
}
