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
  virtual: "Virtual",
  physical: "In person",
  hybrid: "Hybrid",
};

const locationTypeDot: Record<string, string> = {
  virtual: "bg-teal-300",
  physical: "bg-sky-300",
  hybrid: "bg-purple-300",
};

export default async function EventsSection() {
  const events = await getUpcomingEvents();

  return (
    <section className="bg-ocean-900 py-24 md:py-28">
      <div className="section-container">
        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="section-eyebrow">What&apos;s On</span>

            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl">
              Upcoming events
            </h2>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300/80">
              Explore upcoming sessions, programs, and professional gatherings
              designed for the OMSP community.
            </p>
          </div>

          <Link
            href="/events"
            className="btn-ghost self-start whitespace-nowrap sm:self-auto"
          >
            View all events
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="glass-card p-12 text-center md:p-14">
            <p className="text-sm leading-6 text-slate-400">
              No upcoming events have been scheduled yet.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              New programs will appear here once they are published.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <article
                key={event.id}
                className="glass-card group flex flex-col p-7 transition-all duration-300 hover:-translate-y-1 hover:border-teal-400/20 md:p-8"
              >
                <div className="mb-5 flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      locationTypeDot[event.location_type] ?? "bg-slate-400"
                    }`}
                  />

                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    {locationTypeLabel[event.location_type]}
                  </span>

                  {event.is_featured && (
                    <span className="ml-auto rounded-full bg-teal-400/10 px-3 py-1 text-[11px] font-medium text-teal-300">
                      Featured
                    </span>
                  )}
                </div>

                <time
                  dateTime={event.event_date}
                  className="mb-3 block font-mono text-xs text-teal-300/90"
                >
                  {formatDate(event.event_date)}
                </time>

                <h3 className="font-display text-lg font-semibold leading-snug tracking-tight text-white transition-colors group-hover:text-teal-200">
                  {event.title}
                </h3>

                {event.description && (
                  <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-slate-300/80">
                    {event.description}
                  </p>
                )}

                <div className="mt-6 border-t border-ocean-700/30 pt-5">
                  {event.registration_form_id ? (
                    <Link
                      href="/events"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-300 transition-colors hover:text-teal-200"
                    >
                      Register
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                        />
                      </svg>
                    </Link>
                  ) : (
                    <span className="text-xs leading-6 text-slate-500">
                      Registration details coming soon
                    </span>
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