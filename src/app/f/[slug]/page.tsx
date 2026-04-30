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
    .filter((f: any) => f.is_active !== false)
    .sort((a: any, b: any) => a.field_order - b.field_order);

  return data as FormWithFields;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const form = await getForm(params.slug);

  if (!form) {
    return { title: "Form Not Found" };
  }

  return {
    title: form.title,
    description: form.description ?? `Apply via OMSP — ${form.title}`,
  };
}

export default async function PublicFormPage({ params }: PageProps) {
  const form = await getForm(params.slug);

  if (!form) notFound();

  const expired = isExpired(form.deadline);

  return (
    <div className="min-h-screen bg-ocean-950 flex flex-col">
      <header className="border-b border-ocean-800/60 bg-ocean-900/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <a
            href="/"
            className="text-teal-400 hover:text-teal-300 transition-colors text-sm font-medium"
          >
            OMSP
          </a>
          <span className="text-ocean-700">/</span>
          <span className="text-slate-400 text-sm truncate">
            {form.title}
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 lg:py-16">
        <div className="mb-10">
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-white leading-tight">
            {form.title}
          </h1>

          {form.description && (
            <p className="mt-4 text-slate-300 leading-relaxed">
              {form.description}
            </p>
          )}

          {form.deadline && (
            <div className="mt-4 flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  expired ? "bg-red-400" : "bg-teal-400"
                }`}
              />
              <span
                className={`text-sm font-mono ${
                  expired ? "text-red-400" : "text-slate-400"
                }`}
              >
                {expired
                  ? `Closed: ${formatDate(form.deadline)}`
                  : `Deadline: ${formatDate(form.deadline)}`}
              </span>
            </div>
          )}
        </div>

        {expired ? (
          <div className="glass-card p-10 sm:p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-red-400"
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

            <h2 className="font-display text-xl font-bold text-white mb-2">
              This form is now closed
            </h2>

            <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
              Thank you for your interest. This form is no longer accepting
              responses at this time.
            </p>

            <a
              href="/opportunities"
              className="btn-ghost inline-flex mt-6 text-sm px-6 py-2.5"
            >
              View Other Opportunities
            </a>
          </div>
        ) : (
          <PublicFormClient form={form} />
        )}
      </main>

      <footer className="border-t border-ocean-800/40 py-6">
        <p className="text-center text-slate-600 text-xs">
          Powered by OMSP &mdash; Organization of Marine Science Professionals
        </p>
      </footer>
    </div>
  );
}