"use client";

import { useEffect } from "react";

interface ErrorProps {
  error:  Error & { digest?: string };
  reset:  () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to your error monitoring service here (e.g. Sentry)
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-ocean-950 text-white font-body">
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-bold text-white mb-3">
              Something went wrong
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              An unexpected error occurred. Please try again or contact support if the problem persists.
            </p>
            {error.digest && (
              <p className="text-slate-600 text-xs font-mono mb-6">
                Error ID: {error.digest}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="btn-primary px-6 py-3 text-sm"
              >
                Try Again
              </button>
              <a href="/" className="btn-ghost px-6 py-3 text-sm">
                Go Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
