'use client';

import { useState } from 'react';
import { updateAdminAccount } from '@/actions/user';

type EditAdminProfileModalProps = {
  initialName: string;
  initialEmail: string;
};

export function EditAdminProfileModal({ initialName, initialEmail }: EditAdminProfileModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await updateAdminAccount({
        name,
        email,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(res.message || 'Admin account updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(null);
        }, 1200);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update admin account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
      >
        <span>✏️</span> Edit Admin Credentials
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>🛡️</span> Edit Admin Account
                </h3>
                <p className="text-xs text-slate-500">Update administrative details & master login password.</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-semibold">
                  ⚠️ {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 font-semibold">
                  ✓ {success}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Administrator Display Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 focus:outline-none"
                  placeholder="Platform Admin"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Admin Login Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 focus:outline-none"
                  placeholder="admin@emerkato.com"
                />
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-3">
                <p className="text-xs font-bold text-slate-700">🔐 Password Management (Optional)</p>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:border-purple-600 focus:outline-none"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:border-purple-600 focus:outline-none"
                    placeholder="At least 6 characters"
                  />
                </div>

                {newPassword && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-800 focus:border-purple-600 focus:outline-none"
                      placeholder="Repeat new password"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition disabled:opacity-50 shadow-xs"
                >
                  {loading ? 'Saving...' : 'Save Admin Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
