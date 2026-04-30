import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase";
import { formatDate, isExpired } from "@/lib/utils";
import type { Form } from "@/types";

export const dynamic = "force-dynamic";

async function getForms(): Promise<Form[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("forms")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Form[]) ?? [];
}

const statusBadge: Record<string, string> = {
  draft:     "badge-draft",
  published: "badge-published",
  closed:    "badge-closed",
};

export default async function FormsPage() {
  const forms = await getForms();
  const published = forms.filter((f) => f.status === "published").length;

  return (
    <div>
      <div className="admin-page-header flex items-start justify-between gap-4">
        <div>
          <h1 className="admin-page-title">Forms</h1>
          <p className="admin-page-subtitle">
            {forms.length} total &mdash; {published} published
          </p>
        </div>
        <Link href="/admin/forms/new" className="btn-primary text-sm px-5 py-2.5">
          Create Form
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <p className="text-slate-500 mb-4">No forms yet. Create your first form.</p>
          <Link href="/admin/forms/new" className="btn-primary text-sm">Create Form</Link>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ocean-700/50">
                {["Title", "Status", "Deadline", "Public URL", ""].map((h) => (
                  <th key={h} className="text-left px-6 py-4 text-xs font-mono text-slate-500 uppercase tracking-wider first:pl-6 last:text-right">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ocean-700/30">
              {forms.map((form) => {
                const expired = isExpired(form.deadline);
                const publicUrl = `/f/${form.slug}`;
                return (
                  <tr key={form.id} className="hover:bg-ocean-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white text-sm font-medium">{form.title}</p>
                        {form.description && (
                          <p className="text-slate-500 text-xs mt-0.5 max-w-xs truncate">
                            {form.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={statusBadge[form.status]}>
                        {expired && form.status === "published" ? "Expired" : form.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {form.deadline ? (
                        <span className={`text-sm ${expired ? "text-red-400" : "text-slate-400"}`}>
                          {formatDate(form.deadline, { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {form.status === "published" ? (
                        <a
                          href={publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-teal-400 hover:text-teal-300 transition-colors"
                        >
                          /f/{form.slug}
                        </a>
                      ) : (
                        <span className="text-slate-600 text-xs font-mono">/f/{form.slug}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/admin/submissions?form_id=${form.id}`}
                          className="text-slate-400 hover:text-white text-xs transition-colors"
                        >
                          Submissions
                        </Link>
                        <Link
                          href={`/admin/forms/${form.id}`}
                          className="text-teal-400 hover:text-teal-300 text-sm transition-colors"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
