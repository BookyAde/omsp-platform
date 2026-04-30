// ─── Form Field Types ──────────────────────────────────────────────────────────

// "file" removed — not yet implemented. Re-add when Supabase Storage upload
// flow is built and tested end-to-end.
export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "file";

export type FormStatus = "draft" | "published" | "closed";

// ─── Database Models ───────────────────────────────────────────────────────────

export interface Form {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: FormStatus;
  deadline: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  
}

export interface FormField {
  id: string;
  form_id: string;
  label: string;
  field_type: FieldType;
  placeholder: string | null;
  required: boolean;
  options: string[] | null;
  field_order: number;

  // 👇 ADD THESE
  accepted_types: string[] | null;
  max_size_mb: number | null;

  // existing
  is_active: boolean;
  archived_at: string | null;
  created_at: string;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  submitted_at: string;
  ip_address: string | null;
  form?: Form;
  values?: FormSubmissionValue[];
}

export interface FormSubmissionValue {
  id: string;
  submission_id: string;
  field_id: string;
  value: string;
  field?: FormField;
}

// ─── Frontend / Builder Types ──────────────────────────────────────────────────

export interface FormFieldDraft extends Omit<FormField, "form_id" | "created_at" | "archived_at"> {
  // id may be a real DB UUID (when editing) or a temporary client-generated ID (new field)
  id: string;
}

export interface FormDraft extends Omit<Form, "id" | "created_at" | "updated_at" | "created_by"> {
  fields: FormFieldDraft[];
}

export type FormWithFields = Form & {
  form_fields: FormField[];
};

export type SubmissionWithValues = FormSubmission & {
  values: (FormSubmissionValue & { field: FormField })[];
};
