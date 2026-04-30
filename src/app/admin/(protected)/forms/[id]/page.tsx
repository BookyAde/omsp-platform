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

        console.log("---- EDIT FORM PAGE ----");
        console.log("Form ID from route:", formId);

        const res = await fetch(`/api/forms/${formId}`);
        console.log("API status:", res.status, res.statusText);

        if (!res.ok) {
          console.error("API request failed. Redirecting back to /admin/forms");
          router.push("/admin/forms");
          return;
        }

        const data = await res.json();
        console.log("RAW API RESPONSE:", data);

        const form = data.form ?? data;
        const rawFields = data.fields ?? data.form_fields ?? form.fields ?? [];

        console.log("FORM OBJECT USED:", form);
        console.log("RAW FIELDS USED:", rawFields);

        const mappedFields = Array.isArray(rawFields)
          ? rawFields.map((f: any, i: number) => ({
              id: f.id,
              label: f.label ?? "",
              field_type: f.field_type,
              placeholder: f.placeholder ?? null,
              required: !!f.required,
              options: f.options ?? null,
              field_order: f.field_order ?? f.sort_order ?? i,
            }))
          : [];

        console.log("MAPPED FIELDS:", mappedFields);

        const builtInitialData = {
          id: form.id,
          title: form.title ?? "",
          slug: form.slug ?? "",
          description: form.description ?? "",
          status: form.status ?? "draft",
          visibility: form.visibility ?? "public",
          deadline: form.deadline ?? null,
          fields: mappedFields,        
        };

        console.log("FINAL INITIAL DATA PASSED TO FORMBUILDER:", builtInitialData);

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