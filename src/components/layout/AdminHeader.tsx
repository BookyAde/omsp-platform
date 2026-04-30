"use client";

import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "@/lib/constants";

interface AdminHeaderProps {
  user: { email: string; full_name: string | null };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const router   = useRouter();
  const pathname = usePathname();

  // Derive page title from nav
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
    <header className="h-16 bg-ocean-900/80 backdrop-blur-sm border-b border-ocean-800/60
                       flex items-center justify-between px-6 lg:px-8 sticky top-0 z-30">
      {/* Page title */}
      <h1 className="font-display text-lg font-bold text-white">{pageTitle}</h1>

      {/* Right: user + sign out */}
      <div className="flex items-center gap-4">
        {/* User info */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-white text-sm font-medium leading-none">
            {user.full_name ?? "Admin"}
          </span>
          <span className="text-slate-500 text-xs mt-0.5">{user.email}</span>
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/30
                        flex items-center justify-center text-teal-400 text-xs font-bold">
          {(user.full_name ?? user.email).charAt(0).toUpperCase()}
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg
                     hover:bg-red-400/10"
          title="Sign out"
        >
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
          </svg>
        </button>
      </div>
    </header>
  );
}
