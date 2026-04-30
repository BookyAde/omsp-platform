/**
 * Content Management — not available in this version.
 *
 * Site content (hero text, announcements, etc.) is currently managed
 * directly in the codebase. A database-backed CMS is planned for a future
 * release once the core platform is stable.
 *
 * This module has been intentionally left inactive rather than providing
 * a broken or misleading interface.
 */

export default function ContentPage() {
  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Content Management</h1>
        <p className="admin-page-subtitle">Not available in this version.</p>
      </div>

      <div className="glass-card p-10 flex flex-col items-start gap-4 max-w-xl">
        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-600 flex-shrink-0" />
          <span className="text-slate-400 text-sm font-medium">Module disabled</span>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed">
          Content management is not functional in the current version. Public site
          content — including the homepage headline, vision text, and programme
          descriptions — is defined in the codebase and deployed with the application.
        </p>

        <p className="text-slate-500 text-sm leading-relaxed">
          A lightweight database-backed CMS will be added in a future release, allowing
          admins to edit key content areas without a code deployment. The nav link for
          this module has been removed until it is ready.
        </p>

        <div className="mt-2 pt-5 border-t border-ocean-700/40 w-full">
          <p className="text-slate-600 text-xs font-mono">
            To update site content now, edit the relevant files in{" "}
            <code className="text-slate-500">src/components/public/</code> or{" "}
            <code className="text-slate-500">src/app/(public)/</code> and redeploy.
          </p>
        </div>
      </div>
    </div>
  );
}
