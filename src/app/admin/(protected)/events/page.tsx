import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import type { Event } from "@/types";

export const dynamic = "force-dynamic";

async function getEvents(): Promise<Event[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: false });
  return (data as Event[]) ?? [];
}

const locationLabel: Record<string, string> = {
  virtual: "Virtual", physical: "In-Person", hybrid: "Hybrid",
};

export default async function AdminEventsPage() {
  const events = await getEvents();

  return (
    <div>
      <div className="admin-page-header flex items-start justify-between gap-4">
        <div>
          <h1 className="admin-page-title">Events</h1>
          <p className="admin-page-subtitle">{events.length} total events</p>
        </div>
        <Link href="/admin/events/new" className="btn-primary text-sm px-5 py-2.5">
          Add Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <p className="text-slate-500 mb-4">No events yet.</p>
          <Link href="/admin/events/new" className="btn-primary text-sm">Add Your First Event</Link>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ocean-700/50">
                <th className="text-left px-6 py-4 text-xs font-mono text-slate-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-6 py-4 text-xs font-mono text-slate-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="text-left px-6 py-4 text-xs font-mono text-slate-500 uppercase tracking-wider hidden lg:table-cell">Type</th>
                <th className="text-left px-6 py-4 text-xs font-mono text-slate-500 uppercase tracking-wider hidden sm:table-cell">Featured</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ocean-700/30">
              {events.map((event) => {
                const isPast = new Date(event.event_date) < new Date();
                return (
                  <tr key={event.id} className="hover:bg-ocean-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className={`font-medium text-sm ${isPast ? "text-slate-500" : "text-white"}`}>
                          {event.title}
                        </p>
                        {isPast && <span className="text-xs text-slate-600 font-mono">Past</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-slate-400 text-sm">{formatDate(event.event_date)}</span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="badge-draft">{locationLabel[event.location_type]}</span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {event.is_featured ? (
                        <span className="badge-published">Featured</span>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="text-teal-400 hover:text-teal-300 text-sm transition-colors"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
