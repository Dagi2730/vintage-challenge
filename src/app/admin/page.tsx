import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Header } from '@/src/components/Header';
import { mockUsers } from '@/src/data/mockData';
import { hasDbConfiguration } from '@/lib/account-store';
import { prisma } from '@/lib/prisma';
import { adminApproveVerification, adminDeclineVerification, adminClearVerificationQueue } from '@/actions/fayda';
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
        where: {
          OR: [
            { verificationState: { in: ['IN_PROGRESS', 'VERIFIED', 'DECLINED'] } },
            { NOT: { nationalIdUrl: null } },
          ],
        },
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
        if (u.nationalIdUrl && !map.has(u.id)) {
          map.set(u.id, {
            id: u.id,
            name: u.name,
            email: u.email,
            fanNumber: u.fanNumber ?? u.phoneNumber ?? '123456789012',
            nationalIdUrl: u.nationalIdUrl,
            verificationState: u.verificationState || (u.verifiedStatus ? 'VERIFIED' : 'UNVERIFIED'),
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

  if (hasDbConfiguration()) {
    try {
      await prisma.listing.deleteMany({
        where: {
          OR: [
            { photos: { has: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80' } },
            { title: { in: ['dining table', 'iphone 15 pro max', 'sofas', 'house'] } },
          ],
        },
      });
    } catch (e) {
      console.error('Failed to auto-clean legacy demo listings:', e);
    }
  }

  const listingsRes = await searchListings({ limit: 100 });
  const allListings = listingsRes?.data ?? [];

  let reports: any[] = [];
  if (!hasDbConfiguration()) {
    try {
      reports = await prisma.report.findMany({
        include: {
          reporter: { select: { name: true, email: true } },
          listing: { select: { title: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      console.error('Failed to fetch reports:', e);
    }
  }

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
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                {users.length} Records
              </span>
              {users.length > 0 && (
                <form
                  action={async () => {
                    'use server';
                    await adminClearVerificationQueue();
                  }}
                >
                  <button
                    type="submit"
                    className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer shadow-2xs flex items-center gap-1"
                  >
                    🗑️ Clear Queue
                  </button>
                </form>
              )}
            </div>
          </div>

          {users.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No pending or submitted National ID verification requests in queue.
            </div>
          ) : (
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
                            if (u.email && u.email !== u.id) {
                              await adminApproveVerification(u.email);
                            }
                          }}
                        >
                          <button
                            type="submit"
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            Approve ✓
                          </button>
                        </form>
                        <form
                          action={async () => {
                            'use server';
                            await adminDeclineVerification(u.id);
                            if (u.email && u.email !== u.id) {
                              await adminDeclineVerification(u.email);
                            }
                          }}
                        >
                          <button
                            type="submit"
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs rounded-lg transition cursor-pointer"
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
          )}
        </section>

        {/* Reports Queue */}
        <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900">Reported Listings</h2>
              <p className="text-xs text-slate-500 mt-0.5">User-submitted reports for community violations.</p>
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              {reports.length} Reports
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {reports.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No active reports.</div>
            ) : (
              reports.map((report) => (
                <div key={report.id} className="p-4 flex flex-col sm:flex-row gap-4 hover:bg-slate-50 transition">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-sm">
                      <Link href={`/listings/${report.listingId}`} className="hover:text-blue-600 hover:underline">
                        Listing: {report.listing?.title ?? 'Unknown Listing'}
                      </Link>
                    </h3>
                    <p className="text-xs text-slate-600 mt-1"><strong>Reason:</strong> {report.reason}</p>
                    {report.details && <p className="text-xs text-slate-500 italic mt-1">&quot;{report.details}&quot;</p>}
                    <p className="text-[10px] text-slate-400 mt-2">Reported by {report.reporter?.name} ({report.reporter?.email}) on {new Date(report.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col gap-2 justify-center">
                    <DeleteListingButton listingId={report.listingId} redirectAfterDelete={false} />
                  </div>
                </div>
              ))
            )}
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
