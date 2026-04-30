import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requireAdmin, badRequest, serverError, notFound as notFoundResponse } from "@/lib/server-utils";
import { formSchema } from "@/lib/validations";

// ─── GET — single form with fields (admin) ────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("forms")
    .select("*, form_fields(*)")
    .eq("id", params.id)
    .single();

  if (error || !data) return notFoundResponse("Form not found.");

  // Return only active fields in the GET response used by the builder.
  // Archived fields are excluded for the same reason as the edit page:
  // the builder must only see fields that are currently live so that
  // the subsequent PATCH payload reflects the true active state.
  data.form_fields = (data.form_fields ?? [])
    .filter((f: any) => f.is_active !== false)
    .sort((a: any, b: any) => a.field_order - b.field_order);

  return NextResponse.json(data);
}

// ─── PATCH — update form metadata + fields safely ────────────────────────────
//
// Field diffing strategy to preserve historical submission data:
//
//   1. Load existing active field IDs from the database.
//   2. For each incoming field:
//      a. If it has an ID that matches an existing field → UPDATE in place.
//      b. If it has no ID, or an ID not in the DB → INSERT as new field.
//   3. For any existing field whose ID is NOT in the incoming payload →
//      soft-delete: set is_active = false, archived_at = NOW().
//
// Physical rows are NEVER deleted. form_submission_values remain intact.
// Archived fields are hidden from the public form but visible in submission history.

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  let body: unknown;
  try { body = await req.json(); }
  catch { return badRequest("Invalid JSON body."); }

  const parsed = formSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed.", parsed.error.flatten());
  }

  const { fields: incomingFields = [], ...formData } = parsed.data;
  const admin   = createAdminClient();
  const formId  = params.id;

  // Verify the form exists
  const { data: existingForm, error: fetchErr } = await admin
    .from("forms")
    .select("id, slug")
    .eq("id", formId)
    .single();

  if (fetchErr || !existingForm) return notFoundResponse("Form not found.");

  // Enforce slug uniqueness if slug is changing
  if (formData.slug !== existingForm.slug) {
    const { data: slugConflict } = await admin
      .from("forms")
      .select("id")
      .eq("slug", formData.slug)
      .neq("id", formId)
      .maybeSingle();

    if (slugConflict) {
      return badRequest("A form with this slug already exists.");
    }
  }

  // 1. Update form metadata
  const { error: formErr } = await admin
    .from("forms")
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq("id", formId);

  if (formErr) return serverError(formErr.message);

  // 2. Load all currently active field IDs from the database
  const { data: dbFields, error: dbFieldsErr } = await admin
    .from("form_fields")
    .select("id")
    .eq("form_id", formId)
    .eq("is_active", true);

  if (dbFieldsErr) return serverError(dbFieldsErr.message);

  const dbFieldIds = new Set((dbFields ?? []).map((f: any) => f.id));

  // Build sets for the diff
  const incomingWithIds    = incomingFields.filter((f) => f.id && dbFieldIds.has(f.id));
  const incomingNew        = incomingFields.filter((f) => !f.id || !dbFieldIds.has(f.id));
  const incomingKeptIds    = new Set(incomingWithIds.map((f) => f.id!));
  const toArchiveIds       = [...dbFieldIds].filter((id) => !incomingKeptIds.has(id));

  // 3a. UPDATE existing fields in place (preserves IDs → preserves submission values)
  for (const field of incomingWithIds) {
    const { error: updateErr } = await admin
      .from("form_fields")
      .update({
        label:       field.label,
        field_type:  field.field_type,
        placeholder: field.placeholder ?? null,
        required:    field.required ?? false,
        options:     field.options ?? null,
        field_order: field.field_order,
        is_active:   true,
        archived_at: null,
      })
      .eq("id", field.id!)
      .eq("form_id", formId);

    if (updateErr) return serverError(`Failed to update field: ${updateErr.message}`);
  }

  // 3b. INSERT new fields
  if (incomingNew.length > 0) {
    const newRows = incomingNew.map((f, idx) => ({
      form_id:     formId,
      label:       f.label,
      field_type:  f.field_type,
      placeholder: f.placeholder ?? null,
      required:    f.required ?? false,
      options:     f.options ?? null,
      // Offset order so new fields come after retained fields
      field_order: (incomingWithIds.length) + idx,
      is_active:   true,
    }));

    const { error: insertErr } = await admin.from("form_fields").insert(newRows);
    if (insertErr) return serverError(`Failed to insert new fields: ${insertErr.message}`);
  }

  // 3c. SOFT-DELETE removed fields — never physically delete
  if (toArchiveIds.length > 0) {
    const { error: archiveErr } = await admin
      .from("form_fields")
      .update({ is_active: false, archived_at: new Date().toISOString() })
      .in("id", toArchiveIds)
      .eq("form_id", formId);

    if (archiveErr) return serverError(`Failed to archive fields: ${archiveErr.message}`);
  }

  return NextResponse.json({ success: true });
}

// ─── DELETE — remove form (admin only) ───────────────────────────────────────
//
// This physically deletes the form and all its submissions via FK cascade.
// The admin has already confirmed this in the UI. This is intentional.

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const admin = createAdminClient();
  const { error } = await admin.from("forms").delete().eq("id", params.id);
  if (error) return serverError(error.message);

  return NextResponse.json({ success: true });
}
