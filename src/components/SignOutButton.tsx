'use client';

import { logout } from '@/actions/auth';

export function SignOutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="text-sm font-semibold text-slate-700 hover:text-red-600 transition"
      >
        Sign out
      </button>
    </form>
  );
}
