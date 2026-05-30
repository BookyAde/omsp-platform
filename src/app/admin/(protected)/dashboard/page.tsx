"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ---------- Types ----------
type Stats = {
  total_forms: number;
  published_forms: number;
  total_submissions: number;
  submissions_this_month: number;
  total_events: number;
  upcoming_events: number;
  unread_contacts: number;
  active_sponsors: number;
};
type ChartPoint = { date: string; count: number };
type FormSubmissionCount = { title: string; count: number };
type FormAnalytics = { id: string; title: string; total: number; countries: Record<string, number> };

// ---------- Animated Counter ----------
function AnimatedCounter({ value, duration = 800 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{count.toLocaleString()}</>;
}

// ---------- SVG Icons ----------
const IconForms = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-1.125 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);
const IconSubmissions = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
  </svg>
);
const IconEvents = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
);
const IconMessages = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
);

const IconBroadcast = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>;
const IconCertificate = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.746 3.746 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12z" /></svg>;
const IconEvent = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>;
const IconPublicSite = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0 0a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM9 9h6M9 12h6M9 15h6" /></svg>;

// KPI Card
function KPICard({ title, value, subtitle, icon, trend, color }: any) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-white/10 p-5 transition-all duration-300 hover:scale-[1.02] hover:border-cyan-400/40 hover:shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white tracking-tight"><AnimatedCounter value={value} /></p>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          {trend && <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">↑ {trend.value} {trend.label}</p>}
        </div>
        <div className={`rounded-xl bg-${color}-500/10 p-3 text-${color}-400`}>{icon}</div>
      </div>
      <div className={`absolute bottom-0 left-0 h-1 w-0 bg-${color}-400 transition-all duration-500 group-hover:w-full`} />
    </div>
  );
}

// Activity Item
function ActivityItem({ type, title, subtitle, date, link }: any) {
  const iconMap: any = {
    broadcast: <IconBroadcast />,
    certificate: <IconCertificate />,
    submission: <IconSubmissions />,
    contact: <IconMessages />,
  };
  return (
    <Link href={link} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/5">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-slate-300">{iconMap[type] || <IconSubmissions />}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{title}</p>
        <p className="text-xs text-slate-400 truncate">{subtitle}</p>
      </div>
      <div className="text-xs text-slate-500">{date}</div>
    </Link>
  );
}

// Country Bar Chart
function CountryBarChart({ data }: { data: { country: string; count: number }[] }) {
  const COLORS = ['#22d3ee', '#5eead4', '#a78bfa', '#f472b6', '#fb923c', '#4ade80', '#facc15', '#c084fc'];
  if (data.length === 0) return <p className="text-slate-400 text-center py-8">No geolocation data yet. Submissions need a country field.</p>;
  return (
    <div className="mt-4 space-y-2">
      {data.slice(0, 8).map((item, idx) => (
        <div key={item.country} className="flex items-center gap-2">
          <span className="w-28 text-sm text-slate-400 truncate">{item.country}</span>
          <div className="flex-1 h-6 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(item.count / (data[0]?.count || 1)) * 100}%`, backgroundColor: COLORS[idx % COLORS.length] }} />
          </div>
          <span className="text-sm font-mono text-white w-12 text-right">{item.count}</span>
        </div>
      ))}
    </div>
  );
}

// Main Dashboard Component
export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [submissionsByForm, setSubmissionsByForm] = useState<FormSubmissionCount[]>([]);
  const [formsAnalytics, setFormsAnalytics] = useState<FormAnalytics[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>("");

  useEffect(() => {
    async function fetchAll() {
      try {
        const [dashboardRes, analyticsRes] = await Promise.all([
          fetch('/api/admin/dashboard'),
          fetch('/api/admin/dashboard/analytics'),
        ]);
        const dashboardData = await dashboardRes.json();
        const analyticsData = await analyticsRes.json().catch(() => ({ forms: [] }));
        setStats(dashboardData.stats);
        setChartData(dashboardData.chartData);
        setActivities(dashboardData.activities);
        setSubmissionsByForm(dashboardData.submissionsByForm || []);
        setFormsAnalytics(analyticsData.forms || []);
        if (analyticsData.forms?.length > 0) setSelectedFormId(analyticsData.forms[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const selectedForm = formsAnalytics.find(f => f.id === selectedFormId);
  const countryData = selectedForm ? Object.entries(selectedForm.countries).map(([country, count]) => ({ country, count })).sort((a,b) => b.count - a.count) : [];
  const maxFormCount = Math.max(...submissionsByForm.map(f => f.count), 0);

  if (loading) return <DashboardLoading />;
  if (!stats) return <div className="text-center py-12 text-slate-400">Failed to load dashboard.</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-cyan-900/20 via-ocean-800/20 to-ocean-900/20 border border-white/10 px-7 py-6 backdrop-blur-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="mt-1 text-slate-400 text-sm">Welcome back! Here&apos;s your platform overview.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400 border border-emerald-500/20">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
            System Operational
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Forms" value={stats.total_forms} subtitle={`${stats.published_forms} published`} icon={<IconForms />} color="teal" />
        <KPICard title="Submissions" value={stats.total_submissions} subtitle={`${stats.submissions_this_month} this month`} icon={<IconSubmissions />} color="sky" trend={{ value: stats.submissions_this_month, label: "this month" }} />
        <KPICard title="Events" value={stats.total_events} subtitle={`${stats.upcoming_events} upcoming`} icon={<IconEvents />} color="purple" />
        <KPICard title="Unread Messages" value={stats.unread_contacts} subtitle={`${stats.active_sponsors} active sponsors`} icon={<IconMessages />} color="orange" />
      </div>

      {/* Row 1: Submissions Trend + Submissions per Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-ocean-950/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="text-lg font-semibold text-white">Submissions Trend (30 days)</h3><p className="text-xs text-slate-400">Daily submissions</p></div>
            <div className="flex items-center gap-2 text-xs text-slate-400"><span className="inline-block h-2 w-2 rounded-full bg-cyan-400"></span> per day</div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} labelStyle={{ color: '#cbd5e1' }} />
                <Line type="monotone" dataKey="count" stroke="#22d3ee" strokeWidth={2} dot={{ fill: '#22d3ee', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-ocean-950/80 p-5">
          <h3 className="text-lg font-semibold text-white mb-3">Submissions per Form</h3>
          {submissionsByForm.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No submissions yet.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {submissionsByForm.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-40 text-sm text-slate-400 truncate">{item.title}</span>
                  <div className="flex-1 h-6 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-cyan-400/70 transition-all" style={{ width: `${(item.count / maxFormCount) * 100}%` }} />
                  </div>
                  <span className="text-sm font-mono text-white w-12 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Country Analytics + Quick Actions (2×2 grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-ocean-950/80 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold text-white">Submissions by Country</h3>
            <select value={selectedFormId} onChange={(e) => setSelectedFormId(e.target.value)} className="text-sm bg-slate-800 border border-white/10 rounded-xl px-3 py-1.5 text-white">
              {formsAnalytics.map(form => <option key={form.id} value={form.id}>{form.title} ({form.total})</option>)}
            </select>
          </div>
          {selectedForm ? <CountryBarChart data={countryData} /> : <p className="text-slate-400 text-sm text-center py-8">Select a form to see country breakdown.</p>}
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-ocean-950/80 p-5">
          <h3 className="text-lg font-semibold text-white mb-3">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={() => router.push('/admin/broadcasts/new')} className="flex items-center gap-3 rounded-xl bg-cyan-500/10 px-4 py-3 text-white transition hover:bg-cyan-500/20 border border-cyan-500/20">
              <IconBroadcast /> New Broadcast
            </button>
            <button onClick={() => router.push('/admin/certificates/new')} className="flex items-center gap-3 rounded-xl bg-emerald-500/10 px-4 py-3 text-white transition hover:bg-emerald-500/20 border border-emerald-500/20">
              <IconCertificate /> Generate Certificate
            </button>
            <button onClick={() => router.push('/admin/events/new')} className="flex items-center gap-3 rounded-xl bg-purple-500/10 px-4 py-3 text-white transition hover:bg-purple-500/20 border border-purple-500/20">
              <IconEvent /> Create Event
            </button>
            <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl bg-slate-500/10 px-4 py-3 text-white transition hover:bg-slate-500/20 border border-slate-500/20">
              <IconPublicSite /> View Public Site
            </a>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-ocean-950/80 p-5">
        <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-white">Recent Activity</h3><span className="text-xs text-slate-400">Latest updates across the platform</span></div>
        <div className="space-y-1 max-h-96 overflow-y-auto custom-scrollbar">
          {activities.length === 0 ? <p className="text-center text-slate-500 py-8">No recent activity</p> : activities.map((act, idx) => <ActivityItem key={idx} {...act} />)}
        </div>
      </div>

      <style jsx>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }`}</style>
    </div>
  );
}

// Loading skeleton
function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-cyan-900/20 via-ocean-800/20 to-ocean-900/20 border border-white/10 px-7 py-6 animate-pulse"><div className="h-6 bg-slate-700 rounded w-32 mb-2"/><div className="h-4 bg-slate-800 rounded w-64"/></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i=><div key={i} className="rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-white/10 p-5 animate-pulse"><div className="flex items-start justify-between"><div className="flex-1"><div className="h-4 bg-slate-700 rounded w-24 mb-2"/><div className="h-8 bg-slate-700 rounded w-16 mt-1"/><div className="h-3 bg-slate-800 rounded w-32 mt-2"/></div><div className="h-10 w-10 rounded-xl bg-slate-700"/></div></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-ocean-950/80 p-5 animate-pulse"><div className="h-5 bg-slate-700 rounded w-40 mb-4"/><div className="h-64 bg-slate-800/50 rounded-xl"/></div><div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-ocean-950/80 p-5 animate-pulse"><div className="h-5 bg-slate-700 rounded w-40 mb-4"/><div className="space-y-3"><div className="h-6 bg-slate-800 rounded"/><div className="h-6 bg-slate-800 rounded"/><div className="h-6 bg-slate-800 rounded"/></div></div></div>
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-ocean-950/80 p-5 animate-pulse"><div className="h-5 bg-slate-700 rounded w-40 mb-4"/><div className="space-y-2">{[...Array(5)].map((_,i)=><div key={i} className="flex items-center gap-3"><div className="h-9 w-9 rounded-full bg-slate-800"/><div className="flex-1"><div className="h-4 bg-slate-700 rounded w-48 mb-1"/><div className="h-3 bg-slate-800 rounded w-32"/></div><div className="h-3 bg-slate-800 rounded w-16"/></div>)}</div></div>
    </div>
  );
}