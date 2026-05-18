// src/app/(public)/events/[slug]/page.tsx

import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import type { Event } from "@/types";

interface EventPageProps {
  params: {
    slug: string;
  };
}

function LinkifiedText({ text }: { text: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, index) => {
        if (urlRegex.test(part)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 hover:text-teal-300 underline underline-offset-4"
            >
              {part}
            </a>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

export default async function EventPage({ params }: EventPageProps) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      registration_form:forms (
        id,
        title,
        slug,
        status
      )
    `
    )
    .eq("slug", params.slug)
    .eq("status", "published")
    .eq("visibility", "public")
    .single();

  if (error || !data) {
    notFound();
  }

  const event = data as Event;

  return (
    <main className="pt-24 bg-ocean-950 min-h-screen">
      <section className="py-16">
        <div className="section-container max-w-5xl">
          <Link
            href="/events"
            className="text-sm text-teal-400 hover:text-teal-300"
          >
            ← Back to events
          </Link>

          <article className="mt-8 glass-card overflow-hidden">
            {event.cover_image_url && (
              <div className="bg-ocean-900 border-b border-ocean-800">
                <img
                  src={event.cover_image_url}
                  alt={event.title}
                  className="w-full max-h-[520px] object-contain"
                />
              </div>
            )}

            <div className="p-7 md:p-10">
              <p className="font-mono text-xs text-teal-400 mb-3">
                {formatDate(event.event_date)}
              </p>

              <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
                {event.title}
              </h1>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {event.location && (
                  <div className="rounded-xl border border-ocean-800 bg-ocean-900/60 p-4">
                    <p className="text-slate-500 font-mono text-xs mb-1">
                      Location
                    </p>
                    <p className="text-slate-300">{event.location}</p>
                  </div>
                )}

                {event.attendance_type && (
                  <div className="rounded-xl border border-ocean-800 bg-ocean-900/60 p-4">
                    <p className="text-slate-500 font-mono text-xs mb-1">
                      Attendance
                    </p>
                    <p className="text-slate-300 capitalize">
                      {event.attendance_type}
                    </p>
                  </div>
                )}

                {event.start_time && (
                  <div className="rounded-xl border border-ocean-800 bg-ocean-900/60 p-4">
                    <p className="text-slate-500 font-mono text-xs mb-1">
                      Start Time
                    </p>
                    <p className="text-slate-300">{event.start_time}</p>
                  </div>
                )}

                {event.end_time && (
                  <div className="rounded-xl border border-ocean-800 bg-ocean-900/60 p-4">
                    <p className="text-slate-500 font-mono text-xs mb-1">
                      End Time
                    </p>
                    <p className="text-slate-300">{event.end_time}</p>
                  </div>
                )}

                {event.capacity && (
                  <div className="rounded-xl border border-ocean-800 bg-ocean-900/60 p-4">
                    <p className="text-slate-500 font-mono text-xs mb-1">
                      Capacity
                    </p>
                    <p className="text-slate-300">{event.capacity}</p>
                  </div>
                )}
              </div>

              {event.description && (
                <div className="mt-10">
                  <h2 className="font-display text-2xl font-bold text-white mb-4">
                    About this event
                  </h2>

                  <div className="text-slate-300 leading-8 whitespace-pre-line">
                    <LinkifiedText text={event.description} />
                  </div>
                </div>
              )}

              {event.registration_form?.slug && (
                <div className="mt-10 rounded-2xl border border-teal-500/20 bg-teal-500/10 p-6">
                  <h3 className="text-white font-display text-xl font-bold mb-2">
                    Registration
                  </h3>

                  <p className="text-slate-400 text-sm mb-5">
                    Complete the linked form to register for this event.
                  </p>

                  <Link
                    href={`/f/${event.registration_form.slug}`}
                    className="inline-flex rounded-full bg-teal-500 px-6 py-3 text-sm font-semibold text-ocean-950 hover:bg-teal-400 transition-colors"
                  >
                    Register for this event
                  </Link>
                </div>
              )}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}