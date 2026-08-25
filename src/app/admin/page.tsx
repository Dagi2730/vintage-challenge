import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Header } from '@/src/components/Header';
import { mockUsers } from '@/src/data/mockData';
import { hasDbConfiguration } from '@/lib/account-store';
import { prisma } from '@/lib/prisma';
import { adminApproveVerification, adminDeclineVerification } from '@/actions/fayda';
import { getAllVerificationRecords } from '@/lib/verification-store';
import { searchListings } from '@/actions/listings';
import { DeleteListingButton } from '@/src/components/DeleteListingButton';

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  let users: any[] = [];

  if (!hasDbConfiguration()) {
    const vRecords = getAllVerificationRecords();
    users = vRecords.map((rec) => ({
      id: rec.userId,
      name: rec.userName,
      email: rec.userEmail,
      fanNumber: rec.fanNumber,
      nationalIdUrl: rec.nationalIdUrl,
      verificationState: rec.verificationState,
      verifiedStatus: rec.verificationState === 'VERIFIED',
    }));
  } else {
    try {
      const dbUsers = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
      const vRecords = getAllVerificationRecords();
      const map = new Map<string, any>();
      for (const rec of vRecords) {
        map.set(rec.userId, {
          id: rec.userId,
          name: rec.userName,
          email: rec.userEmail,
          fanNumber: rec.fanNumber,
          nationalIdUrl: rec.nationalIdUrl,
          verificationState: rec.verificationState,
          verifiedStatus: rec.verificationState === 'VERIFIED',
        });
      }
      for (const u of dbUsers) {
        if (!map.has(u.id)) {
          map.set(u.id, {
            id: u.id,
            name: u.name,
            email: u.email,
            fanNumber: u.phoneNumber ?? '123456789012',
            nationalIdUrl: u.nationalIdUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80',
            verificationState: u.verifiedStatus ? 'VERIFIED' : 'UNVERIFIED',
            verifiedStatus: u.verifiedStatus,
          });
        }
      }
      users = Array.from(map.values());
    } catch (e) {
      const vRecords = getAllVerificationRecords();
      users = vRecords.map((rec) => ({
        id: rec.userId,
        name: rec.userName,
        email: rec.userEmail,
        fanNumber: rec.fanNumber,
        nationalIdUrl: rec.nationalIdUrl,
        verificationState: rec.verificationState,
        verifiedStatus: rec.verificationState === 'VERIFIED',
      }));
    }
  }

  const listingsRes = await searchListings({ limit: 100 });
  const allListings = listingsRes?.data ?? [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-1 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <span>⚙️</span> Admin Management Portal
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review Fayda National ID verification requests & moderate all active marketplace listings.
            </p>
          </div>
          <Link
            href="/account"
            className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
          >
            <span>⚙️</span> Admin Settings
          </Link>
        </div>

        {/* National ID Verification Queue */}
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900">National ID Verification Queue</h2>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              {users.length} Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-400">
                  <th className="py-3 px-6">User</th>
                  <th className="py-3 px-6">FAN Number</th>
                  <th className="py-3 px-6">National ID Card Photo</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center border border-blue-200 text-xs shadow-xs">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-slate-800">
                      {u.fanNumber ?? '9842-1049-2049'}
                    </td>
                    <td className="py-4 px-6">
                      {u.nationalIdUrl ? (
                        <a href={u.nationalIdUrl} target="_blank" rel="noreferrer" className="block group">
                          <img
                            src={u.nationalIdUrl}
                            alt="ID Document"
                            className="h-12 w-20 object-cover rounded-lg border border-slate-300 shadow-xs group-hover:scale-105 transition"
                          />
                          <span className="text-[10px] text-blue-600 hover:underline mt-0.5 block">View Photo 🔍</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">No Photo</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {u.verificationState === 'VERIFIED' || u.verifiedStatus ? (
                        <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full text-xs border border-emerald-200 inline-flex items-center gap-1">
                          🛡️ Verified
                        </span>
                      ) : u.verificationState === 'IN_PROGRESS' ? (
                        <span className="bg-amber-50 text-amber-900 font-bold px-3 py-1 rounded-full text-xs border border-amber-300 inline-flex items-center gap-1 shadow-2xs">
                          ⏳ Pending Review
                        </span>
                      ) : u.verificationState === 'DECLINED' ? (
                        <span className="bg-red-50 text-red-700 font-bold px-3 py-1 rounded-full text-xs border border-red-200 inline-flex items-center gap-1">
                          ❌ Declined
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 font-semibold px-3 py-1 rounded-full text-xs border border-slate-200">
                          ⚠️ Unverified
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <form
                          action={async () => {
                            'use server';
                            await adminApproveVerification(u.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1"
                          >
                            Approve ✓
                          </button>
                        </form>
                        <form
                          action={async () => {
                            'use server';
                            await adminDeclineVerification(u.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs rounded-lg transition"
                          >
                            Decline ✕
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Marketplace Listings Moderation Panel */}
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>🛡️</span> All Marketplace Listings Moderation
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Administrators can inspect and remove any inappropriate or reported listing post.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              {allListings.length} Total Posts
            </span>
          </div>

          {allListings.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No active listings found in the marketplace.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {allListings.map((item) => (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-16 w-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 flex-shrink-0">
                      {item.photos?.[0] ? (
                        <img src={item.photos[0]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-300 text-xs">No img</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/listings/${item.id}`} className="text-sm font-bold text-slate-900 hover:text-blue-600 line-clamp-1">
                        {item.title}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>Seller: <strong>{item.seller?.name ?? 'Seller'}</strong></span>
                        <span>·</span>
                        <span>ETB {item.price?.toLocaleString()}</span>
                        <span>·</span>
                        <span>{item.city}, {item.neighborhood}</span>
                      </p>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto">
                    <DeleteListingButton listingId={item.id} redirectAfterDelete={false} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
