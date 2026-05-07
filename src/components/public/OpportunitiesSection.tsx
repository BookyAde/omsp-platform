import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase";
import { formatDate, isExpired } from "@/lib/utils";
import type { Form } from "@/types";

async function getFeaturedOpportunities(): Promise<Form[]> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data } = await supabase
      .from("forms")
      .select("id, title, slug, description, deadline")
      .eq("status", "published")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(3);

    return (data as Form[]) ?? [];
  } catch {
    return [];
  }
}

export default async function OpportunitiesSection() {
  const forms = await getFeaturedOpportunities();

  return (
    <section className="bg-ocean-950 py-24 md:py-28">
      <div className="section-container">
        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="section-eyebrow">Open Applications</span>

            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl">
              Current opportunities
            </h2>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300/80">
              Apply for open programs, memberships, calls, and professional
              opportunities from the OMSP community.
            </p>
          </div>

          <Link
            href="/opportunities"
            className="btn-ghost self-start whitespace-nowrap sm:self-auto"
          >
            All opportunities
          </Link>
        </div>

        {forms.length === 0 ? (
          <div className="glass-card p-12 text-center md:p-14">
            <p className="text-sm leading-6 text-slate-400">
              No open opportunities are available at this time.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              New announcements will appear here once they are published.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => {
              const expired = isExpired(form.deadline);

              return (
                <Link
                  key={form.id}
                  href={`/f/${form.slug}`}
                  className="glass-card group flex cursor-pointer flex-col p-7 transition-all duration-300 hover:-translate-y-1 hover:border-teal-400/20 md:p-8"
                >
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <span className={expired ? "badge-closed" : "badge-published"}>
                      {expired ? "Closed" : "Open"}
                    </span>

                    {form.deadline && (
                      <span className="font-mono text-[11px] text-slate-500">
                        {expired
                          ? "Closed"
                          : `Deadline: ${formatDate(form.deadline, {
                              month: "short",
                              day: "numeric",
                            })}`}
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-lg font-semibold leading-snug tracking-tight text-white transition-colors group-hover:text-teal-200">
                    {form.title}
                  </h3>

                  {form.description && (
                    <p className="mt-3 line-clamp-2 text-sm leading-7 text-slate-300/80">
                      {form.description}
                    </p>
                  )}

                  {!expired && (
                    <div className="mt-6 border-t border-ocean-700/30 pt-5">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-300 transition-all group-hover:gap-2 group-hover:text-teal-200">
                        Apply now
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.8}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                          />
                        </svg>
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}