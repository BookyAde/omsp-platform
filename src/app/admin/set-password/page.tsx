// src/app/admin/set-password/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase";

export default function SetPasswordPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // The confirm route sets the session cookie before redirecting here. If there
  // is none (expired/used link, direct visit), send the user back to login.
  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        window.location.replace("/admin/login?error=session_missing");
        return;
      }
      setCheckingSession(false);
    });
  }, []);

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Password set successfully, send them to the dashboard
    window.location.href = "/admin/dashboard";
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-ocean-950 flex items-center justify-center text-slate-400 text-sm">
        Verifying your link...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ocean-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md glass-card p-8 rounded-2xl border border-white/10 bg-white/[0.03]">
        <h1 className="font-display text-2xl font-bold text-white mb-2">Set Your Password</h1>
        <p className="text-slate-400 text-sm mb-6">Please create a secure password to access your admin dashboard.</p>

        <form onSubmit={handleSetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="password">
              New Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="confirm-password">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-teal-500 px-4 py-3 font-medium text-slate-950 hover:bg-teal-400 disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving..." : "Save Password & Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
