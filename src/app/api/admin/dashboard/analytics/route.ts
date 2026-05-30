import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/server-utils";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createAdminClient();

  // Query with explicit join to forms
  const { data, error } = await supabase
    .from("form_submissions")
    .select(`
      form_id,
      country,
      forms (title)
    `);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const formMap: Record<string, { title: string; countries: Record<string, number> }> = {};

  for (const row of data || []) {
    const formId = row.form_id;
    if (!formId) continue;

    const formTitle = (row.forms as any)?.title || "Untitled";
    const country = row.country || "Unknown";

    if (!formMap[formId]) {
      formMap[formId] = { title: formTitle, countries: {} };
    }
    formMap[formId].countries[country] = (formMap[formId].countries[country] || 0) + 1;
  }

  const forms = Object.entries(formMap).map(([id, data]) => ({
    id,
    title: data.title,
    total: Object.values(data.countries).reduce((a, b) => a + b, 0),
    countries: data.countries,
  }));

  return NextResponse.json({ forms });
}