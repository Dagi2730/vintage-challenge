import Link from 'next/link';
import { getCategories } from '@/actions/categories';
import { SellForm } from '@/src/app/sell/SellForm';

export default async function SellPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600">E-merkato Seller</Link>
        <span className="text-sm font-medium text-slate-600">Create New Listing</span>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 w-full flex-1">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Create New Listing</h1>
          <p className="text-sm text-slate-500 mb-8">Provide detailed information to help buyers find your item.</p>
          <SellForm categories={categories} />
        </div>
      </main>
    </div>
  );
}
