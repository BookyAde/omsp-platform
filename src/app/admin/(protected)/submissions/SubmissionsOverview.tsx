// src/app/admin/(protected)/submissions/SubmissionsOverview.tsx

import Link from "next/link";

type FormWithCounts = {
  id: string;
  title: string;
  slug: string;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

interface SubmissionsOverviewProps {
  forms: FormWithCounts[];
}

export default function SubmissionsOverview({
  forms,
}: SubmissionsOverviewProps) {
  if (forms.length === 0) {
    return (
      <div className="glass-card p-16 text-center">
        <p className="text-slate-500 text-sm">
          No forms found. Create a form first.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {forms.map((form) => (
        <div key={form.id} className="glass-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-white text-base font-semibold">
                {form.title}
              </h2>

              <p className="text-slate-500 text-xs font-mono mt-1">
                /f/{form.slug}
              </p>
            </div>

            <span className="text-xs font-mono px-2.5 py-1 rounded border border-teal-500/30 bg-teal-500/10 text-teal-400">
              {form.total} total
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
              <p className="text-yellow-400 text-lg font-semibold">
                {form.pending}
              </p>
              <p className="text-slate-500 text-xs">Pending</p>
            </div>

            <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3">
              <p className="text-green-400 text-lg font-semibold">
                {form.approved}
              </p>
              <p className="text-slate-500 text-xs">Approved</p>
            </div>

            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3">
              <p className="text-red-400 text-lg font-semibold">
                {form.rejected}
              </p>
              <p className="text-slate-500 text-xs">Rejected</p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <a
              href={`/f/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-300 text-xs transition-colors"
            >
              View public form
            </a>

            <Link
              href={`/admin/submissions?form_id=${form.id}`}
              className="btn-primary text-sm px-4 py-2"
            >
              View submissions
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}