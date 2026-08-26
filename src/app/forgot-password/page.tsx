'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h1>
        <p className="text-sm text-slate-500 mb-6">Enter your email address and we will send you a link to reset your password.</p>

        {submitted ? (
          <div className="rounded-lg bg-green-50 p-4 border border-green-200">
            <h3 className="text-sm font-bold text-green-800 mb-1">Check your inbox</h3>
            <p className="text-xs text-green-700">
              If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              ← Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition cursor-pointer"
            >
              Send Reset Link
            </button>

            <p className="text-center text-sm text-slate-500 mt-4">
              Remember your password?{' '}
              <Link href="/login" className="text-blue-600 font-medium hover:underline">
                Log in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
