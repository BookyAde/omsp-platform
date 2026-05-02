"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FormBuilder from "@/components/forms/FormBuilder";

export default function EditFormPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    async function loadForm() {
      try {
        setLoading(true);

        const res = await fetch(`/api/forms/${formId}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          router.push("/admin/forms");
          return;
        }

        const data = await res.json();

        const form = data.form ?? data;
        const rawFields = data.fields ?? data.form_fields ?? form.fields ?? [];

        const mappedFields = Array.isArray(rawFields)
          ? rawFields.map((field: any, index: number) => ({
              id: field.id,
              label: field.label ?? "",
              field_type: field.field_type,
              placeholder: field.placeholder ?? null,
              required: Boolean(field.required),
              options: field.options ?? null,
              field_order: field.field_order ?? index,
              is_active: field.is_active ?? true,

              step: field.step ?? "General",

              accepted_types: field.accepted_types ?? [],
              max_size_mb: field.max_size_mb ?? 5,
            }))
          : [];

        const builtInitialData = {
          id: form.id,
          title: form.title ?? "",
          slug: form.slug ?? "",
          description: form.description ?? "",
          status: form.status ?? "draft",
          visibility: form.visibility ?? "public",

          requires_review: form.requires_review ?? false,
          form_mode: form.form_mode ?? "single_page",

          deadline: form.deadline ?? null,
          fields: mappedFields,
        };

        setInitialData(builtInitialData);
      } catch (error) {
        console.error("Failed to load form:", error);
        router.push("/admin/forms");
      } finally {
        setLoading(false);
      }
    }

    if (formId) {
      loadForm();
    }
  }, [formId, router]);

  if (loading) {
    return (
      <div className="glass-card p-12 flex justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-teal-500/30 border-t-teal-500 animate-spin" />
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="glass-card p-8">
        <p className="text-slate-400">Form not found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Edit Form</h1>
        <p className="admin-page-subtitle">Update form details and fields</p>
      </div>

      <FormBuilder initialData={initialData} />
    </div>
  );
}