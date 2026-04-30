import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

interface Submission {
  id: string;
  submitted_at: string;
  form: { title: string; slug: string } | null;
}

interface RecentSubmissionsProps {
  submissions: Submission[];
}

export default function RecentSubmissions({ submissions }: RecentSubmissionsProps) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-bold text-white">Recent Submissions</h3>
        <Link href="/admin/submissions" className="text-teal-400 hover:text-teal-300 text-xs transition-colors">
          View all
        </Link>
      </div>

      {submissions.length === 0 ? (
        <p className="text-slate-500 text-sm py-6 text-center">No submissions yet.</p>
      ) : (
        <div className="divide-y divide-ocean-700/40">
          {submissions.map((sub) => (
            <div key={sub.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {sub.form?.title ?? "Unknown form"}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {formatDateTime(sub.submitted_at)}
                </p>
              </div>
              <Link
                href={`/admin/submissions?form=${sub.form?.slug ?? ""}`}
                className="text-xs text-teal-400 hover:text-teal-300 transition-colors flex-shrink-0"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
