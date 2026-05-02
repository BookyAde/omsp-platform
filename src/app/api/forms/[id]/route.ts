import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import {
  requireAdmin,
  badRequest,
  serverError,
  notFound as notFoundResponse,
} from "@/lib/server-utils";
import { formSchema } from "@/lib/validations";

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

  data.form_fields = (data.form_fields ?? [])
    .filter((field: any) => field.is_active !== false)
    .sort((a: any, b: any) => a.field_order - b.field_order);

  return NextResponse.json(data);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const parsed = formSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("Validation failed.", parsed.error.flatten());
  }

  const { fields: incomingFields = [], ...formData } = parsed.data;
  const admin = createAdminClient();
  const formId = params.id;

  const { data: existingForm, error: fetchErr } = await admin
    .from("forms")
    .select("id, slug")
    .eq("id", formId)
    .single();

  if (fetchErr || !existingForm) {
    return notFoundResponse("Form not found.");
  }

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

  const { error: formErr } = await admin
    .from("forms")
    .update({
      ...formData,
      form_mode: formData.form_mode ?? "single_page",
      updated_at: new Date().toISOString(),
    })
    .eq("id", formId);

  if (formErr) return serverError(formErr.message);

  const { data: dbFields, error: dbFieldsErr } = await admin
    .from("form_fields")
    .select("id")
    .eq("form_id", formId)
    .eq("is_active", true);

  if (dbFieldsErr) return serverError(dbFieldsErr.message);

  const dbFieldIds = new Set((dbFields ?? []).map((field: any) => field.id));

  const incomingWithIds = incomingFields.filter(
    (field) => field.id && dbFieldIds.has(field.id)
  );

  const incomingNew = incomingFields.filter(
    (field) => !field.id || !dbFieldIds.has(field.id)
  );

  const incomingKeptIds = new Set(incomingWithIds.map((field) => field.id!));

  const toArchiveIds = [...dbFieldIds].filter(
    (id) => !incomingKeptIds.has(id)
  );

  for (const field of incomingWithIds) {
    const { error: updateErr } = await admin
      .from("form_fields")
      .update({
        label: field.label,
        field_type: field.field_type,
        placeholder: field.placeholder ?? null,
        required: field.required ?? false,
        options: field.options ?? null,
        field_order: field.field_order,
        is_active: true,
        archived_at: null,
        step: field.step ?? "General",
        accepted_types: field.accepted_types ?? null,
        max_size_mb: field.max_size_mb ?? null,
      })
      .eq("id", field.id!)
      .eq("form_id", formId);

    if (updateErr) {
      return serverError(`Failed to update field: ${updateErr.message}`);
    }
  }

  if (incomingNew.length > 0) {
    const newRows = incomingNew.map((field, index) => ({
      form_id: formId,
      label: field.label,
      field_type: field.field_type,
      placeholder: field.placeholder ?? null,
      required: field.required ?? false,
      options: field.options ?? null,
      field_order: incomingWithIds.length + index,
      is_active: true,
      step: field.step ?? "General",
      accepted_types: field.accepted_types ?? null,
      max_size_mb: field.max_size_mb ?? null,
    }));

    const { error: insertErr } = await admin
      .from("form_fields")
      .insert(newRows);

    if (insertErr) {
      return serverError(`Failed to insert new fields: ${insertErr.message}`);
    }
  }

  if (toArchiveIds.length > 0) {
    const { error: archiveErr } = await admin
      .from("form_fields")
      .update({
        is_active: false,
        archived_at: new Date().toISOString(),
      })
      .in("id", toArchiveIds)
      .eq("form_id", formId);

    if (archiveErr) {
      return serverError(`Failed to archive fields: ${archiveErr.message}`);
    }
  }

  return NextResponse.json({ success: true });
}

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