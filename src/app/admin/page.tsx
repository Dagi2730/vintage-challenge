import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Header } from '@/src/components/Header';
import { mockUsers } from '@/src/data/mockData';
import { hasDbConfiguration } from '@/lib/account-store';
import { prisma } from '@/lib/prisma';
import { adminApproveVerification, adminDeclineVerification } from '@/actions/fayda';
import { getAllVerificationRecords } from '@/lib/verification-store';

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
      users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {
      users = mockUsers;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-1 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <span>⚙️</span> Admin National ID (Fayda) Verification Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review submitted FAN numbers & National ID photographs to approve or decline user verification requests.
            </p>
          </div>
          <Link
            href="/account"
            className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
          >
            <span>⚙️</span> Admin Settings
          </Link>
        </div>

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
                            alt="National ID"
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
      </main>
    </div>
  );
}
