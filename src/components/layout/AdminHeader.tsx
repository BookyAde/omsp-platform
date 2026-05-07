"use client";

import { useRouter, usePathname } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import { ADMIN_NAV } from "@/lib/constants";

interface AdminHeaderProps {
  user: {
    email: string;
    full_name: string | null;
  };
  onMenuClick: () => void;
}

export default function AdminHeader({
  user,
  onMenuClick,
}: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const current = ADMIN_NAV.find(
    (n) => pathname === n.href || pathname.startsWith(n.href + "/")
  );

  const pageTitle = current?.label ?? "Admin";

  async function handleSignOut() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b
                 border-ocean-800/60 bg-ocean-900/80 px-4 backdrop-blur-sm
                 sm:px-6 lg:px-8"
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg border
                     border-ocean-700 bg-ocean-800/70 text-slate-300
                     transition-colors hover:text-white lg:hidden"
          aria-label="Open admin menu"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>

        <h1 className="truncate font-display text-base font-bold text-white sm:text-lg">
          {pageTitle}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-medium leading-none text-white">
            {user.full_name ?? "Admin"}
          </span>
          <span className="mt-0.5 max-w-[180px] truncate text-xs text-slate-500">
            {user.email}
          </span>
        </div>

        <div
          className="flex h-8 w-8 items-center justify-center rounded-full border
                     border-teal-500/30 bg-teal-500/20 text-xs font-bold
                     text-teal-400"
        >
          {(user.full_name ?? user.email).charAt(0).toUpperCase()}
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-lg p-1.5 text-slate-500 transition-colors
                     hover:bg-red-400/10 hover:text-red-400"
          title="Sign out"
          aria-label="Sign out"
        >
          <svg
            className="h-[18px] w-[18px]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}