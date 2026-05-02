// ─── Form Field Types ──────────────────────────────────────────────────────────

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
export type FormMode = "single_page" | "multi_step";

// ─── Database Models ───────────────────────────────────────────────────────────

export interface Form {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: FormStatus;
  visibility: "public" | "private";
  requires_review: boolean;
  form_mode: FormMode;
  deadline: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
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
  step: string | null;
  accepted_types: string[] | null;
  max_size_mb: number | null;
  is_active: boolean;
  archived_at: string | null;
  created_at: string;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  submitted_at: string;
  ip_address: string | null;
  status?: "pending" | "approved" | "rejected";
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

export interface FormFieldDraft
  extends Omit<FormField, "form_id" | "created_at" | "archived_at"> {
  id: string;
}

export interface FormDraft
  extends Omit<Form, "id" | "created_at" | "updated_at" | "created_by"> {
  fields: FormFieldDraft[];
}

export type FormWithFields = Form & {
  form_fields: FormField[];
};

export type SubmissionWithValues = FormSubmission & {
  values: (FormSubmissionValue & { field: FormField })[];
};