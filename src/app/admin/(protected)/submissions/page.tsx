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
      )
    `)
    .order("submitted_at", { ascending: false })
    .limit(200);

  if (formId) {
    query = query.eq("form_id", formId);
  }

  const { data: submissions } = await query;

  const sorted = (submissions ?? []).map((sub: any) => ({
    ...sub,
    values: [...(sub.values ?? [])].sort(
      (a: any, b: any) =>
        (a.field?.field_order ?? 0) - (b.field?.field_order ?? 0)
    ),
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
    const related = (submissions ?? []).filter(
      (sub: any) => sub.form_id === form.id
    );

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

  if (!selectedFormId) {
    const formsWithCounts = await getFormsWithCounts();

    const totalSubmissions = formsWithCounts.reduce(
      (sum, form) => sum + form.total,
      0
    );

    return (
      <div>
        <div className="admin-page-header">
          <h1 className="admin-page-title">Submissions</h1>
          <p className="admin-page-subtitle">
            {formsWithCounts.length} form
            {formsWithCounts.length !== 1 ? "s" : ""} • {totalSubmissions} total
            submission{totalSubmissions !== 1 ? "s" : ""}
          </p>
        </div>

        <SubmissionsOverview forms={formsWithCounts} />
      </div>
    );
  }

  const { forms, submissions } = await getData(selectedFormId);

  const selectedForm = forms.find((form) => form.id === selectedFormId);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          {selectedForm?.title ?? "Form Submissions"}
        </h1>
        <p className="admin-page-subtitle">
          {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
        </p>
      </div>
      <a
        href="/admin/submissions"
        className="btn-ghost text-sm px-4 py-2 inline-flex mb-5"
      >
        ← Back to all forms
      </a>
      
      <SubmissionsClient
        forms={forms}
        submissions={submissions}
        selectedFormId={selectedFormId}
      />
    </div>
  );
}