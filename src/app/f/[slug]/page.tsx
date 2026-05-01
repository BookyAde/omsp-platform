import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import { isExpired, formatDate } from "@/lib/utils";
import PublicFormClient from "./PublicFormClient";
import type { FormWithFields } from "@/types";
import type { Metadata } from "next";

interface PageProps {
  params: { slug: string };
}

async function getForm(slug: string): Promise<FormWithFields | null> {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from("forms")
    .select("*, form_fields(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!data) return null;

  data.form_fields = (data.form_fields ?? [])
    .filter((field: any) => field.is_active !== false)
    .sort((a: any, b: any) => a.field_order - b.field_order);

  return data as FormWithFields;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const form = await getForm(params.slug);

  if (!form) {
    return {
      title: "Form Not Found | OMSP",
    };
  }

  return {
    title: `${form.title} | OMSP`,
    description: form.description ?? `Apply via OMSP — ${form.title}`,
  };
}

export default async function PublicFormPage({ params }: PageProps) {
  const form = await getForm(params.slug);

  if (!form) notFound();

  const expired = isExpired(form.deadline);

  return (
    <div className="min-h-screen bg-ocean-950 text-white">
      <header className="sticky top-0 z-30 border-b border-ocean-800/60 bg-ocean-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <a
            href="/"
            className="text-sm font-semibold text-teal-400 transition-colors hover:text-teal-300"
          >
            OMSP
          </a>

          <a
            href="/opportunities"
            className="text-xs font-medium text-slate-400 transition-colors hover:text-white"
          >
            Opportunities
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 py-10 lg:py-14">
        <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-teal-400">
            OMSP Application Portal
          </p>

          <h1 className="font-display text-3xl font-bold leading-tight text-white lg:text-4xl">
            {form.title}
          </h1>

          {form.description && (
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              {form.description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-teal-400/20 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
              Professional Application
            </span>

            {form.deadline && (
              <span
                className={`rounded-full border px-3 py-1 text-xs font-mono ${
                  expired
                    ? "border-red-400/20 bg-red-500/10 text-red-300"
                    : "border-white/10 bg-white/5 text-slate-300"
                }`}
              >
                {expired
                  ? `Closed: ${formatDate(form.deadline)}`
                  : `Deadline: ${formatDate(form.deadline)}`}
              </span>
            )}
          </div>
        </section>

        {expired ? (
          <div className="glass-card p-10 text-center sm:p-12">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
              <svg
                className="h-7 w-7 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
            </div>

            <h2 className="font-display mb-2 text-xl font-bold text-white">
              This form is now closed
            </h2>

            <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-400">
              Thank you for your interest. This form is no longer accepting
              responses at this time.
            </p>

            <a
              href="/opportunities"
              className="btn-ghost mt-6 inline-flex px-6 py-2.5 text-sm"
            >
              View Other Opportunities
            </a>
          </div>
        ) : (
          <PublicFormClient form={form} />
        )}
      </main>

      <footer className="border-t border-ocean-800/40 py-6">
        <p className="text-center text-xs text-slate-600">
          Powered by OMSP &mdash; Organization of Marine Science Professionals
        </p>
      </footer>
    </div>
  );
}