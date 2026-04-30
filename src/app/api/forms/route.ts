import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requireAdmin, badRequest, serverError } from "@/lib/server-utils";
import { formSchema } from "@/lib/validations";

// ─── GET — list all forms with fields (admin only) ────────────────────────────

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("forms")
    .select("*, form_fields(*)")
    .order("created_at", { ascending: false });

  if (error) return serverError(error.message);

  // Sort fields within each form by order
  const sorted = (data ?? []).map((form: any) => ({
    ...form,
    form_fields: (form.form_fields ?? []).sort(
      (a: any, b: any) => a.field_order - b.field_order
    ),
  }));

  return NextResponse.json(sorted);
}

// ─── POST — create a new form (admin only) ────────────────────────────────────

export async function POST(req: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  let body: unknown;
  try { body = await req.json(); }
  catch { return badRequest("Invalid JSON body."); }

  const parsed = formSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest("Validation failed.", parsed.error.flatten());
  }

  const { fields = [], ...formData } = parsed.data;
  const admin = createAdminClient();

  // Enforce slug uniqueness on create
  const { data: existing } = await admin
    .from("forms")
    .select("id")
    .eq("slug", formData.slug)
    .maybeSingle();

  if (existing) {
    return badRequest("A form with this slug already exists.");
  }

  // Get the current admin user ID to set created_by
  const { createServerSupabaseClient } = await import("@/lib/supabase");
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: form, error: formErr } = await admin
    .from("forms")
    .insert({ ...formData, created_by: user!.id })
    .select()
    .single();

  if (formErr) return serverError(formErr.message);

  // Insert fields — only active field types accepted (file excluded by schema)
  if (fields.length > 0) {
    const fieldRows = fields.map((f, idx) => ({
      form_id:     form.id,
      label:       f.label,
      field_type:  f.field_type,
      placeholder: f.placeholder ?? null,
      required:    f.required ?? false,
      options:     f.options ?? null,
      field_order: idx,
      is_active:   true,
    }));

    const { error: fieldsErr } = await admin.from("form_fields").insert(fieldRows);
    if (fieldsErr) return serverError(fieldsErr.message);
  }

  return NextResponse.json(form, { status: 201 });
}
