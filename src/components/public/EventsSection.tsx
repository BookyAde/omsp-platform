import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import type { Event } from "@/types";

async function getUpcomingEvents(): Promise<Event[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("events")
      .select(`
        id,
        title,
        description,
        event_date,
        location_type,
        is_featured,
        registration_form_id
      `)
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .limit(3);
    return (data as Event[]) ?? [];
  } catch {
    return [];
  }
}

const locationTypeLabel: Record<string, string> = {
  virtual:  "Virtual",
  physical: "In-Person",
  hybrid:   "Hybrid",
};

const locationTypeDot: Record<string, string> = {
  virtual:  "bg-teal-400",
  physical: "bg-sky-400",
  hybrid:   "bg-purple-400",
};

export default async function EventsSection() {
  const events = await getUpcomingEvents();

  return (
    <section className="py-24 bg-ocean-900">
      <div className="section-container">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <span className="section-eyebrow">What&apos;s On</span>
            <h2 className="font-display text-4xl font-bold text-white leading-tight">
              Upcoming Events
            </h2>
          </div>
          <Link href="/events" className="btn-ghost self-start sm:self-auto flex-shrink-0">
            View All Events
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="glass-card p-14 text-center">
            <p className="text-slate-500 text-sm">No upcoming events scheduled yet.</p>
            <p className="text-slate-600 text-xs mt-1">Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <article
                key={event.id}
                className="glass-card p-7 flex flex-col hover:border-teal-500/30 hover:-translate-y-0.5
                           transition-all duration-200 group"
              >
                {/* Type badge */}
                <div className="flex items-center gap-2 mb-5">
                  <span className={`w-2 h-2 rounded-full ${locationTypeDot[event.location_type] ?? "bg-slate-400"}`} />
                  <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                    {locationTypeLabel[event.location_type]}
                  </span>
                  {event.is_featured && (
                    <span className="ml-auto font-mono text-xs text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">
                      Featured
                    </span>
                  )}
                </div>

                {/* Date */}
                <time
                  dateTime={event.event_date}
                  className="font-mono text-xs text-teal-400 mb-3"
                >
                  {formatDate(event.event_date)}
                </time>

                {/* Title */}
                <h3 className="font-display text-lg font-bold text-white mb-3 leading-snug
                               group-hover:text-teal-300 transition-colors">
                  {event.title}
                </h3>

                {/* Description */}
                {event.description && (
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 flex-1">
                    {event.description}
                  </p>
                )}

                {/* CTA */}
                <div className="mt-6 pt-5 border-t border-ocean-700/40">
                  {event.registration_form_id ? (
                    <Link
                      href={`/events`}
                      className="text-teal-400 hover:text-teal-300 text-sm font-medium
                                 flex items-center gap-1.5 transition-colors"
                    >
                      Register
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                  ) : (
                    <span className="text-slate-500 text-xs">Registration details coming soon</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
