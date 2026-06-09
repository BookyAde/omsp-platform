// src/app/admin/(protected)/submissions/page.tsx

import { createServerSupabaseClient } from "@/lib/supabase";
import SubmissionsClient from "./SubmissionsClient";
import SubmissionsOverview from "./SubmissionsOverview";
import type { Form } from "@/types";

export const dynamic = "force-dynamic";

type FormWithCounts = {
  id: string;
  title: string;
  slug: string;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};

async function getData(formId?: string) {
  const supabase = await createServerSupabaseClient();

  const { data: forms } = await supabase
    .from("forms")
    .select("id, title, slug")
    .order("title");

  let query = supabase
    .from("form_submissions")
    .select(`
      id,
      submitted_at,
      ip_address,
      status,
      form_id,
      form:forms(id, title, slug, requires_review),
      values:form_submission_values(
        id,
        value,
        field:form_fields(id, label, field_type, field_order, is_active)
      ),
      submission_reviews!left(
        summary,
        score,
        strengths,
        improvements,
        flags,
        location_analysis,
        rejection_risk,
        promising,
        fields_summary
      )
    `)
    .order("submitted_at", { ascending: false })
    .limit(300);

  if (formId) {
    query = query.eq("form_id", formId);
  }

  const { data: submissions } = await query;

  const sorted = (submissions ?? []).map((sub: any) => ({
    ...sub,
    values: [...(sub.values ?? [])].sort(
      (a: any, b: any) => (a.field?.field_order ?? 0) - (b.field?.field_order ?? 0)
    ),
    ai_review: sub.submission_reviews?.[0] || null,
  }));

  return {
    forms: (forms ?? []) as Form[],
    submissions: sorted,
  };
}

async function getFormsWithCounts(): Promise<FormWithCounts[]> {
  const supabase = await createServerSupabaseClient();

  const { data: forms } = await supabase
    .from("forms")
    .select("id, title, slug")
    .order("title");

  const { data: submissions } = await supabase
    .from("form_submissions")
    .select("form_id, status");

  return (forms ?? []).map((form: any) => {
    const related = (submissions ?? []).filter((sub: any) => sub.form_id === form.id);

    return {
      id: form.id,
      title: form.title,
      slug: form.slug,
      total: related.length,
      pending: related.filter((sub: any) => sub.status === "pending").length,
      approved: related.filter((sub: any) => sub.status === "approved").length,
      rejected: related.filter((sub: any) => sub.status === "rejected").length,
    };
  });
}

interface PageProps {
  searchParams: {
    form_id?: string;
  };
}

export default async function SubmissionsPage({ searchParams }: PageProps) {
  const selectedFormId = searchParams.form_id;

  // Overview Page (All Forms)
  if (!selectedFormId) {
    const formsWithCounts = await getFormsWithCounts();
    const totalSubmissions = formsWithCounts.reduce((sum, form) => sum + form.total, 0);

    return (
      <div className="space-y-8">
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title text-4xl font-semibold tracking-tight">Submissions</h1>
            <p className="text-muted-foreground text-lg">
              Manage all form submissions • {totalSubmissions} total
            </p>
          </div>
        </div>

        <SubmissionsOverview forms={formsWithCounts} />
      </div>
    );
  }

  // Specific Form Submissions Page
  const { forms, submissions } = await getData(selectedFormId);
  const selectedForm = forms.find((form) => form.id === selectedFormId);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {selectedForm?.title ?? "Form Submissions"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {submissions.length} submission{submissions.length !== 1 ? "s" : ""} • 
            Real-time AI-powered insights
          </p>
        </div>

        <a
          href="/admin/submissions"
          className="btn-ghost flex items-center gap-2 text-sm hover:bg-muted px-4 py-2 rounded-lg transition-colors"
        >
          ← Back to All Forms
        </a>
      </div>

      <SubmissionsClient
        forms={forms}
        submissions={submissions}
        selectedFormId={selectedFormId}
      />
    </div>
  );
}