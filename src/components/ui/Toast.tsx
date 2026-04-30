"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastVariant = "success" | "error" | "info" | "warning";

interface Toast {
  id:       string;
  message:  string;
  variant:  ToastVariant;
  duration: number;
}

interface ToastContextValue {
  toasts:  Toast[];
  toast:   (message: string, variant?: ToastVariant, duration?: number) => void;
  dismiss: (id: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "info", duration = 4000) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, variant, duration }]);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastRenderer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

// ─── Renderer ─────────────────────────────────────────────────────────────────

const variantStyles: Record<ToastVariant, string> = {
  success: "border-teal-500/30 bg-ocean-800",
  error:   "border-red-500/30 bg-ocean-800",
  info:    "border-ocean-600/50 bg-ocean-800",
  warning: "border-orange-500/30 bg-ocean-800",
};

const iconStyles: Record<ToastVariant, { color: string; path: string }> = {
  success: {
    color: "text-teal-400",
    path: "m4.5 12.75 6 6 9-13.5",
  },
  error: {
    color: "text-red-400",
    path: "M6 18 18 6M6 6l12 12",
  },
  info: {
    color: "text-sky-400",
    path: "M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z",
  },
  warning: {
    color: "text-orange-400",
    path: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z",
  },
};

function ToastItem({ toast: t, dismiss }: { toast: Toast; dismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => dismiss(t.id), t.duration);
    return () => clearTimeout(timer);
  }, [t.id, t.duration, dismiss]);

  const { color, path } = iconStyles[t.variant];

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-ocean-lg",
        "min-w-[280px] max-w-sm animate-fade-up",
        variantStyles[t.variant]
      )}
      role="alert"
    >
      <svg
        className={cn("w-4 h-4 mt-0.5 flex-shrink-0", color)}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
      </svg>
      <p className="text-white text-sm flex-1 leading-snug">{t.message}</p>
      <button
        onClick={() => dismiss(t.id)}
        className="text-slate-500 hover:text-white transition-colors flex-shrink-0 mt-0.5"
        aria-label="Dismiss"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function ToastRenderer({
  toasts,
  dismiss,
}: {
  toasts: Toast[];
  dismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} dismiss={dismiss} />
      ))}
    </div>
  );
}
