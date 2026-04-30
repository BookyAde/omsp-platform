import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase";
import { formatDate, isExpired } from "@/lib/utils";
import type { Form } from "@/types";

export const metadata: Metadata = {
  title: "Opportunities",
  description: "Browse open opportunities and applications from OMSP — programs, workshops, and more.",
};

export const revalidate = 300;

async function getForms(): Promise<Form[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("forms")
      .select("*")
      .eq("status", "published")
      .eq("visibility", "public")
      .order("created_at", { ascending: false });
    return (data as Form[]) ?? [];
  } catch {
    return [];
  }
}

export default async function OpportunitiesPage() {
  const forms = await getForms();
  const active = forms.filter((f) => !isExpired(f.deadline));
  const closed = forms.filter((f) => isExpired(f.deadline));

  return (
    <div className="pt-24">
      <section className="py-16 bg-ocean-900">
        <div className="section-container">
          <span className="section-eyebrow">Applications</span>
          <h1 className="font-display text-5xl font-bold text-white leading-tight">Opportunities</h1>
          <p className="mt-4 text-slate-400 max-w-xl">
            Apply for OMSP programs, workshops, research opportunities, and more. All forms are free and open to members.
          </p>
        </div>
      </section>

      <section className="py-16 bg-ocean-950">
        <div className="section-container">
          {active.length === 0 && closed.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <p className="text-slate-500">No open opportunities at this time.</p>
              <p className="text-slate-600 text-sm mt-1">Follow us on LinkedIn to be notified when new forms open.</p>
            </div>
          ) : (
            <>
              {active.length > 0 && (
                <>
                  <h2 className="font-display text-2xl font-bold text-white mb-6">Open Now</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
                    {active.map((form) => (
                      <Link
                        key={form.id}
                        href={`/f/${form.slug}`}
                        className="glass-card p-7 flex flex-col hover:border-teal-500/30 hover:-translate-y-0.5 transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="badge-published">Open</span>
                          {form.deadline && (
                            <span className="font-mono text-xs text-slate-500">
                              Deadline: {formatDate(form.deadline, { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-lg font-bold text-white mb-3 group-hover:text-teal-300 transition-colors flex-1 leading-snug">
                          {form.title}
                        </h3>
                        {form.description && (
                          <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{form.description}</p>
                        )}
                        <div className="mt-6 pt-4 border-t border-ocean-700/40">
                          <span className="text-teal-400 text-sm font-medium flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                            Apply Now
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {closed.length > 0 && (
                <>
                  <h2 className="font-display text-xl font-bold text-white mb-6 text-slate-400">Closed</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-50">
                    {closed.map((form) => (
                      <div key={form.id} className="glass-card p-7">
                        <span className="badge-closed mb-4 block w-fit">Closed</span>
                        <h3 className="font-display text-base font-bold text-slate-400 leading-snug">{form.title}</h3>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
