import StatsCard from "@/components/dashboard/StatsCard";
import RecentSubmissions from "@/components/dashboard/RecentSubmissions";
import RecentContacts from "@/components/dashboard/RecentContacts";
import QuickActions from "@/components/dashboard/QuickActions";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { DashboardStats } from "@/types";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const supabase = await createServerSupabaseClient();

  const now = new Date().toISOString();
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).toISOString();

  const [
    formsRes,
    submissionsRes,
    eventsRes,
    contactsRes,
    sponsorsRes,
    recentSubsRes,
    recentContactsRes,
  ] = await Promise.all([
    supabase.from("forms").select("status", { count: "exact" }),

    supabase.from("form_submissions").select("submitted_at", {
      count: "exact",
    }),

    supabase.from("events").select("event_date", { count: "exact" }),

    supabase.from("contacts").select("status", { count: "exact" }),

    supabase.from("sponsors").select("is_active", { count: "exact" }),

    supabase
      .from("form_submissions")
      .select("id, submitted_at, form:forms(title, slug)")
      .order("submitted_at", { ascending: false })
      .limit(5),

    supabase
      .from("contacts")
      .select("id, name, email, subject, status, submitted_at")
      .order("submitted_at", { ascending: false })
      .limit(5),
  ]);

  const stats: DashboardStats = {
    total_forms: formsRes.count ?? 0,
    published_forms:
      formsRes.data?.filter((f: any) => f.status === "published").length ?? 0,

    total_submissions: submissionsRes.count ?? 0,
    submissions_this_month:
      submissionsRes.data?.filter((s: any) => s.submitted_at >= monthStart)
        .length ?? 0,

    total_events: eventsRes.count ?? 0,
    upcoming_events:
      eventsRes.data?.filter((e: any) => e.event_date >= now).length ?? 0,

    unread_contacts:
      contactsRes.data?.filter((c: any) => c.status === "unread").length ?? 0,

    active_sponsors:
      sponsorsRes.data?.filter((s: any) => s.is_active === true).length ?? 0,
  };

  return {
    stats,
    recentSubmissions: (recentSubsRes.data ?? []) as any[],
    recentContacts: (recentContactsRes.data ?? []) as any[],
  };
}

function IconForms() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-1.125 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

function IconSubmissions() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
    </svg>
  );
}

function IconEvents() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}

export default async function DashboardPage() {
  const { stats, recentSubmissions, recentContacts } = await getDashboardData();

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-ocean-800 to-ocean-800/50 border border-ocean-700/50 px-7 py-6 flex items-center justify-between gap-6">
        <div>
          <h2 className="font-display text-xl font-bold text-white">Welcome back</h2>
          <p className="text-slate-400 text-sm mt-1">
            Here is what is happening with OMSP today.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-teal-400 text-xs font-mono">Platform live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Forms"
          value={stats.total_forms}
          subtitle={`${stats.published_forms} published`}
          icon={<IconForms />}
          accent="teal"
        />

        <StatsCard
          title="Submissions"
          value={stats.total_submissions}
          subtitle={`${stats.submissions_this_month} this month`}
          icon={<IconSubmissions />}
          accent="sky"
          trend={{ value: stats.submissions_this_month, label: "this month" }}
        />

        <StatsCard
          title="Events"
          value={stats.total_events}
          subtitle={`${stats.upcoming_events} upcoming`}
          icon={<IconEvents />}
          accent="purple"
        />

        <StatsCard
          title="Unread Messages"
          value={stats.unread_contacts}
          subtitle={`${stats.active_sponsors} active sponsors`}
          icon={<IconMail />}
          accent="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <QuickActions />
        </div>

        <div className="lg:col-span-1">
          <RecentSubmissions submissions={recentSubmissions} />
        </div>

        <div className="lg:col-span-1">
          <RecentContacts contacts={recentContacts} />
        </div>
      </div>
    </div>
  );
}