import FormBuilder from "@/components/forms/FormBuilder";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create Form" };

export default function NewFormPage() {
  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Create Form</h1>
        <p className="admin-page-subtitle">
          Build a dynamic form. Fields, options, and settings are all configurable.
        </p>
      </div>
      <FormBuilder />
    </div>
  );
}
