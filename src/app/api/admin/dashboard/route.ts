import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/server-utils";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = await createServerSupabaseClient();

  const now = new Date().toISOString();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30); // 30‑day trend

  // Parallel queries
  const [
    formsRes,
    submissionsRes,
    submissionsTrendRes,
    eventsRes,
    contactsRes,
    sponsorsRes,
    recentBroadcastsRes,
    recentCertificatesRes,
    recentSubsRes,
    recentContactsRes,
    submissionsByFormRes,
  ] = await Promise.all([
    supabase.from("forms").select("status", { count: "exact" }),
    supabase.from("form_submissions").select("submitted_at", { count: "exact" }),
    supabase.from("form_submissions").select("submitted_at").gte("submitted_at", last30Days.toISOString()),
    supabase.from("events").select("event_date", { count: "exact" }),
    supabase.from("contacts").select("status", { count: "exact" }),
    supabase.from("sponsors").select("is_active", { count: "exact" }),
    supabase.from("email_broadcasts").select("id, subject, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("certificates").select("id, certificate_id, recipient_name, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("form_submissions").select("id, submitted_at, form:forms(title, slug)").order("submitted_at", { ascending: false }).limit(5),
    supabase.from("contacts").select("id, name, email, subject, status, submitted_at").order("submitted_at", { ascending: false }).limit(5),
    supabase.from("form_submissions").select("form_id, form:forms(title)").not("form_id", "is", null),
  ]);

  // Stats
  const stats = {
    total_forms: formsRes.count ?? 0,
    published_forms: formsRes.data?.filter((f: any) => f.status === "published").length ?? 0,
    total_submissions: submissionsRes.count ?? 0,
    submissions_this_month: submissionsRes.data?.filter((s: any) => s.submitted_at >= monthStart).length ?? 0,
    total_events: eventsRes.count ?? 0,
    upcoming_events: eventsRes.data?.filter((e: any) => e.event_date >= now).length ?? 0,
    unread_contacts: contactsRes.data?.filter((c: any) => c.status === "unread").length ?? 0,
    active_sponsors: sponsorsRes.data?.filter((s: any) => s.is_active === true).length ?? 0,
  };

  // Chart data (last 30 days)
  const trendMap = new Map<string, number>();
  (submissionsTrendRes.data ?? []).forEach((sub: any) => {
    const date = new Date(sub.submitted_at).toISOString().split("T")[0];
    trendMap.set(date, (trendMap.get(date) || 0) + 1);
  });
  const chartData = Array.from(trendMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30); // last 30 days

  // Submissions per form (for bar chart)
  const formCounts: Record<string, { title: string; count: number }> = {};
  (submissionsByFormRes.data ?? []).forEach((sub: any) => {
    const id = sub.form_id;
    const title = sub.form?.title || "Unknown Form";
    if (!formCounts[id]) formCounts[id] = { title, count: 0 };
    formCounts[id].count++;
  });
  const submissionsByForm = Object.values(formCounts).sort((a, b) => b.count - a.count);

  // Activity feed
  const activities = [
    ...(recentBroadcastsRes.data ?? []).map((b: any) => ({
      type: "broadcast",
      title: b.subject,
      subtitle: "Broadcast email sent",
      date: new Date(b.created_at).toLocaleDateString(),
      link: `/admin/broadcasts/${b.id}`,
    })),
    ...(recentCertificatesRes.data ?? []).map((c: any) => ({
      type: "certificate",
      title: `Certificate for ${c.recipient_name}`,
      subtitle: c.certificate_id,
      date: new Date(c.created_at).toLocaleDateString(),
      link: `/admin/certificates/${c.id}`,
    })),
    ...(recentSubsRes.data ?? []).map((s: any) => ({
      type: "submission",
      title: s.form?.title || "Form submission",
      subtitle: "New submission",
      date: new Date(s.submitted_at).toLocaleDateString(),
      link: `/admin/submissions`,
    })),
    ...(recentContactsRes.data ?? []).map((c: any) => ({
      type: "contact",
      title: c.name,
      subtitle: c.subject,
      date: new Date(c.submitted_at).toLocaleDateString(),
      link: `/admin/contacts`,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

  return NextResponse.json({
    stats,
    chartData,
    activities,
    submissionsByForm,
  });
}