import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requireAdmin, badRequest, serverError } from "@/lib/server-utils";
import { formSchema } from "@/lib/validations";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("forms")
    .select("*, form_fields(*)")
    .order("created_at", { ascending: false });

  if (error) return serverError(error.message);

  const sorted = (data ?? []).map((form: any) => ({
    ...form,
    form_fields: (form.form_fields ?? []).sort(
      (a: any, b: any) => a.field_order - b.field_order
    ),
  }));

  return NextResponse.json(sorted);
}

export async function POST(req: NextRequest) {
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

  const { fields = [], ...formData } = parsed.data;
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("forms")
    .select("id")
    .eq("slug", formData.slug)
    .maybeSingle();

  if (existing) {
    return badRequest("A form with this slug already exists.");
  }

  const { createServerSupabaseClient } = await import("@/lib/supabase");
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return serverError("Unable to identify admin user.");
  }

  const { data: form, error: formErr } = await admin
    .from("forms")
    .insert({
      ...formData,
      form_mode: formData.form_mode ?? "single_page",
      created_by: user.id,
    })
    .select()
    .single();

  if (formErr) return serverError(formErr.message);

  if (fields.length > 0) {
    const fieldRows = fields.map((field, index) => ({
      form_id: form.id,
      label: field.label,
      field_type: field.field_type,
      placeholder: field.placeholder ?? null,
      required: field.required ?? false,
      options: field.options ?? null,
      field_order: index,
      is_active: true,
      step: field.step ?? "General",
      accepted_types: field.accepted_types ?? null,
      max_size_mb: field.max_size_mb ?? null,
    }));

    const { error: fieldsErr } = await admin
      .from("form_fields")
      .insert(fieldRows);

    if (fieldsErr) return serverError(fieldsErr.message);
  }

  return NextResponse.json(form, { status: 201 });
}