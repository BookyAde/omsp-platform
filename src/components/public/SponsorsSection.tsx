import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { Sponsor } from "@/types";

async function getActiveSponsors(): Promise<Sponsor[]> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data } = await supabase
      .from("sponsors")
      .select("id, name, logo_url, website_url")
      .eq("is_active", true)
      .order("tier", { ascending: true });

    return (data as Sponsor[]) ?? [];
  } catch {
    return [];
  }
}

const VALUE_PROPS = [
  {
    title: "Talent Pipeline",
    body: "Access a curated pool of trained, career-ready marine science graduates and early-career professionals.",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.7}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
        />
      </svg>
    ),
  },
  {
    title: "Brand Visibility",
    body: "Reach a focused audience of marine science students, academics, and institutions across Africa and beyond.",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.7}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </svg>
    ),
  },
  {
    title: "Ocean Impact",
    body: "Align your organisation with credible ocean sustainability work and community-led conservation initiatives.",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.7}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
        />
      </svg>
    ),
  },
  {
    title: "Strategic Positioning",
    body: "Position your brand as a champion of the next generation of ocean scientists at a pivotal moment for marine conservation.",
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.7}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
        />
      </svg>
    ),
  },
];

export default async function SponsorsSection() {
  const sponsors = await getActiveSponsors();

  return (
    <section className="bg-ocean-900 py-24 md:py-28">
      <div className="section-container">
        <div className="relative mb-16 overflow-hidden rounded-[32px] border border-ocean-700/40">
          <div className="absolute inset-0 bg-gradient-to-br from-ocean-800 via-ocean-900 to-teal-500/20" />

          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgba(45,212,191,0.8) 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative z-10 flex flex-col items-start justify-between gap-10 px-8 py-14 lg:flex-row lg:items-center lg:px-14 lg:py-16">
            <div className="max-w-xl">
              <span className="section-eyebrow">Partner With Us</span>

              <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-white lg:text-4xl">
                Invest in the future
                <br />
                of ocean science
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300/85 md:text-base">
                OMSP is building the next generation of marine science
                professionals. Partner with us and place your organisation at
                the centre of that mission.
              </p>
            </div>

            <Link
              href="/partners"
              className="btn-primary flex-shrink-0 px-7 py-3 text-sm font-medium md:text-base"
            >
              Become a Partner
            </Link>
          </div>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map((prop) => (
            <div key={prop.title} className="glass-card p-6 md:p-7">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-400/10 text-teal-300">
                {prop.icon}
              </div>

              <h3 className="font-display text-base font-semibold tracking-tight text-white">
                {prop.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-300/75">
                {prop.body}
              </p>
            </div>
          ))}
        </div>

        {sponsors.length > 0 && (
          <div>
            <p className="mb-8 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-slate-500">
              Our Partners
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              {sponsors.map((sponsor) => (
                <a
                  key={sponsor.id}
                  href={sponsor.website_url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card flex min-w-[170px] items-center justify-center px-8 py-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-400/20"
                  title={sponsor.name}
                >
                  {sponsor.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sponsor.logo_url}
                      alt={sponsor.name}
                      className="h-8 object-contain opacity-75 transition-opacity duration-300 hover:opacity-100"
                    />
                  ) : (
                    <span className="text-sm font-medium text-slate-400">
                      {sponsor.name}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}