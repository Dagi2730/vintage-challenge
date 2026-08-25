import Link from 'next/link';
import { auth } from '@/auth';
import { SignOutButton } from '@/src/components/SignOutButton';

type HeaderProps = {
  showSearch?: boolean;
  searchValue?: string;
};

export async function Header({ showSearch = false, searchValue = '' }: HeaderProps) {
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN';

  if (isAdmin) {
    return (
      <header className="bg-white border-b border-purple-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span className="text-purple-600">E-merkato</span>
            <span className="bg-purple-100 text-purple-800 text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-md border border-purple-200">
              Admin Portal
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="text-xs font-bold text-slate-700 hover:text-purple-600 transition flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-50"
          >
            📋 Verification Queue
          </Link>

          <Link
            href="/account"
            className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200 transition flex items-center gap-1.5"
          >
            <span>⚙️</span> Admin Settings
          </Link>

          <SignOutButton />

          <Link
            href="/account"
            className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center text-xs font-black transition shadow-xs cursor-pointer"
            title="Admin Account Settings"
          >
            {session.user.name?.charAt(0).toUpperCase() ?? 'A'}
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link href="/" className="text-xl font-bold text-blue-600 tracking-tight">
        E-merkato
      </Link>

      <div className="flex items-center gap-4">
        {showSearch && (
          <form action="/explore" method="get" className="hidden md:block relative w-72">
            <input
              type="text"
              name="q"
              defaultValue={searchValue}
              placeholder="Search for items..."
              className="w-full bg-slate-100 border border-slate-300 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
          </form>
        )}

        <Link
          href="/sell"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow-sm"
        >
          Sell
        </Link>

        {session?.user ? (
          <>
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition"
            >
              Dashboard
            </Link>
            <SignOutButton />
            <Link
              href="/account"
              className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-700 transition shadow-xs cursor-pointer"
              title="Account Settings & Profile"
            >
              {session.user.name?.charAt(0).toUpperCase() ?? 'U'}
            </Link>
          </>
        ) : (
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition"
          >
            Account
          </Link>
        )}
      </div>
    </header>
  );
}
