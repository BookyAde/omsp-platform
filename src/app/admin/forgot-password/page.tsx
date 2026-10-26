"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/layout/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Intentionally ignored: the message below is the same either way.
    }

    setSubmitted(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-ocean-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-10">
          <Logo size="lg" linked={false} />
        </div>

        <div className="glass-card p-8">
          <h1 className="font-display text-2xl font-bold text-white mb-1">
            Reset Password
          </h1>
          <p className="text-slate-400 text-sm mb-8">
            Enter your admin email and we&apos;ll send you a link to set a new password.
          </p>

          {submitted ? (
            <div className="rounded-lg bg-teal-500/10 border border-teal-500/20 px-4 py-3">
              <p className="text-teal-300 text-sm">
                If that email exists, a reset link has been sent.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="form-label" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="form-input"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3.5 text-base"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/admin/login"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
