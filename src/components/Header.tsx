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

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-2xs">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-xl font-bold text-blue-600 tracking-tight">
          E-merkato
        </Link>
        {isAdmin && (
          <span className="bg-purple-100 text-purple-800 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-md border border-purple-200">
            Admin
          </span>
        )}
      </div>

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

            {isAdmin && (
              <Link
                href="/admin"
                className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs px-3 py-2 rounded-lg border border-purple-200 transition flex items-center gap-1.5 shadow-2xs"
              >
                <span>⚙️</span> Admin Portal
              </Link>
            )}

            <SignOutButton />
            <Link
              href="/account"
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition shadow-xs cursor-pointer ${
                isAdmin
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-blue-100 hover:bg-blue-200 border border-blue-200 text-blue-700'
              }`}
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
