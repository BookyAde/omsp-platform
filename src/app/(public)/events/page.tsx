import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import type { Event } from "@/types";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Upcoming and past OMSP events — webinars, workshops, and the annual conference.",
};

export const revalidate = 300;

async function getEvents() {
  try {
    const supabase = await createServerSupabaseClient();
    const now = new Date().toISOString().split("T")[0];

    const [upcoming, past] = await Promise.all([
      supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .eq("visibility", "public")
        .gte("event_date", now)
        .order("event_date", { ascending: true }),

      supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .eq("visibility", "public")
        .lt("event_date", now)
        .order("event_date", { ascending: false })
        .limit(6),
    ]);

    return {
      upcoming: (upcoming.data as Event[]) ?? [],
      past: (past.data as Event[]) ?? [],
    };
  } catch {
    return { upcoming: [], past: [] };
  }
}

const locationBadge: Record<string, { dot: string; label: string }> = {
  virtual: { dot: "bg-teal-400", label: "Virtual" },
  physical: { dot: "bg-sky-400", label: "In-Person" },
  hybrid: { dot: "bg-purple-400", label: "Hybrid" },
};

function EventCard({ event }: { event: Event }) {
  const badge = locationBadge[event.attendance_type] ?? {
    dot: "bg-slate-400",
    label: event.attendance_type,
  };

  return (
    <article className="glass-card p-7 flex flex-col hover:border-teal-500/30 hover:-translate-y-0.5 transition-all duration-200 group">
      {event.cover_image_url && (
        <img
          src={event.cover_image_url}
          alt={event.title}
          className="mb-5 h-44 w-full rounded-xl object-cover border border-ocean-700"
        />
      )}

      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
        <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">
          {badge.label}
        </span>
      </div>

      <time
        dateTime={event.event_date}
        className="font-mono text-xs text-teal-400 mb-2"
      >
        {formatDate(event.event_date)}
      </time>

      <h3 className="font-display text-lg font-bold text-white mb-3 group-hover:text-teal-300 transition-colors leading-snug">
        {event.title}
      </h3>

      {event.description && (
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 flex-1">
          {event.description}
        </p>
      )}

      {event.location && (
        <p className="mt-4 text-slate-500 text-xs font-mono truncate">
          {event.location}
        </p>
      )}
    </article>
  );
}

export default async function EventsPage() {
  const { upcoming, past } = await getEvents();

  return (
    <div className="pt-24">
      <section className="py-16 bg-ocean-900">
        <div className="section-container">
          <span className="section-eyebrow">What&apos;s On</span>

          <h1 className="font-display text-5xl font-bold text-white leading-tight">
            Events
          </h1>

          <p className="mt-4 text-slate-400 max-w-xl">
            Webinars, workshops, and the annual OMSP virtual conference. All
            events are free for OMSP members.
          </p>
        </div>
      </section>

      <section className="py-16 bg-ocean-950">
        <div className="section-container">
          <h2 className="font-display text-2xl font-bold text-white mb-8">
            Upcoming Events
          </h2>

          {upcoming.length === 0 ? (
            <div className="glass-card p-14 text-center">
              <p className="text-slate-500 text-sm">
                No upcoming events yet. Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {past.length > 0 && (
        <section className="py-16 bg-ocean-900">
          <div className="section-container">
            <h2 className="font-display text-2xl font-bold text-white mb-8">
              Past Events
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-70">
              {past.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}