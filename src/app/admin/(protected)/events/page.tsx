import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import type { Event } from "@/types";

const attendanceLabel: Record<string, string> = {
  virtual: "Virtual",
  physical: "Physical",
  hybrid: "Hybrid",
};

const statusColor: Record<string, string> = {
  draft: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  published: "bg-green-500/10 text-green-300 border-green-500/20",
  completed: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  cancelled: "bg-red-500/10 text-red-300 border-red-500/20",
};

async function getEvents(): Promise<Event[]> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data } = await supabase
      .from("events")
      .select("*")
      .order("event_date", {
        ascending: false,
      });

    return (data as Event[]) ?? [];
  } catch {
    return [];
  }
}

export default async function AdminEventsPage() {
  const events = await getEvents();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="admin-page-title">
            Events
          </h1>

          <p className="admin-page-subtitle">
            {events.length} total events
          </p>
        </div>

        <Link
          href="/admin/events/new"
          className="btn-primary text-sm px-5 py-2.5"
        >
          Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-slate-500 mb-4">
            No events yet.
          </p>

          <Link
            href="/admin/events/new"
            className="btn-primary text-sm"
          >
            Add Your First Event
          </Link>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ocean-800">
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Event
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Attendance
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-ocean-900/60 hover:bg-ocean-900/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {event.cover_image_url ? (
                          <img
                            src={event.cover_image_url}
                            alt={event.title}
                            className="w-16 h-16 rounded-xl object-cover border border-ocean-700"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-ocean-800 border border-ocean-700" />
                        )}

                        <div>
                          <h3 className="text-white font-medium">
                            {event.title}
                          </h3>

                          {event.location && (
                            <p className="text-slate-500 text-sm mt-1">
                              {event.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-300 text-sm">
                      {formatDate(event.event_date)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="badge-draft">
                        {
                          attendanceLabel[
                            event.attendance_type
                          ]
                        }
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs border ${
                          statusColor[event.status]
                        }`}
                      >
                        {event.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="text-teal-400 hover:text-teal-300 text-sm font-medium"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}