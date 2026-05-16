import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import type { Event } from "@/types";

async function getUpcomingEvents(): Promise<Event[]> {
  try {
    const supabase = await createServerSupabaseClient();

    const now = new Date()
      .toISOString()
      .split("T")[0];

    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .eq("visibility", "public")
      .gte("event_date", now)
      .order("event_date", {
        ascending: true,
      })
      .limit(3);

    return (data as Event[]) ?? [];
  } catch {
    return [];
  }
}

const attendanceLabel: Record<string, string> = {
  virtual: "Virtual",
  physical: "Physical",
  hybrid: "Hybrid",
};

export default async function EventsSection() {
  const events = await getUpcomingEvents();

  return (
    <section className="py-24 bg-ocean-950">
      <div className="section-container">
        <div className="flex items-end justify-between gap-6 mb-12">
          <div>
            <span className="section-eyebrow">
              Upcoming
            </span>

            <h2 className="section-title">
              Upcoming events
            </h2>
          </div>

          <Link
            href="/events"
            className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
          >
            View all events
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <p className="text-slate-500">
              No upcoming events have been scheduled yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <article
                key={event.id}
                className="glass-card overflow-hidden group hover:border-teal-500/30 transition-all"
              >
                {event.cover_image_url && (
                  <img
                    src={event.cover_image_url}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                )}

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full bg-teal-400" />

                    <span className="font-mono text-xs text-slate-500 uppercase tracking-wider">
                      {
                        attendanceLabel[
                          event.attendance_type
                        ]
                      }
                    </span>
                  </div>

                  <time className="text-xs font-mono text-teal-400">
                    {formatDate(event.event_date)}
                  </time>

                  <h3 className="mt-3 text-white font-display text-xl font-bold leading-snug group-hover:text-teal-300 transition-colors">
                    {event.title}
                  </h3>

                  {event.description && (
                    <p className="mt-3 text-slate-400 text-sm line-clamp-3">
                      {event.description}
                    </p>
                  )}

                  {event.location && (
                    <p className="mt-5 text-xs text-slate-500 font-mono">
                      {event.location}
                    </p>
                  )}

                  <div className="mt-6">
                    <Link
                      href={`/events/${event.slug}`}
                      className="text-sm text-teal-400 hover:text-teal-300"
                    >
                      View Event →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}