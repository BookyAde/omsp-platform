import type { Metadata } from "next";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { Sponsor } from "@/types";

export const metadata: Metadata = {
  title: "Partners & Sponsors",
  description:
    "Partner with OMSP to invest in the future of marine science. Access a talent pipeline, gain visibility, and align with ocean sustainability.",
};

export const revalidate = 3600;

const TIERS = [
  {
    name: "Platinum",
    price: "By discussion",
    color: "from-sky-400/20 to-sky-500/5",
    border: "border-sky-500/30",
    badge: "text-sky-400 bg-sky-400/10",
    perks: [
      "Headline sponsor recognition across all platforms",
      "Logo on all event materials and communications",
      "Dedicated speaker slot at the annual conference",
      "Access to member CV database",
      "Quarterly impact report",
      "Co-branded training sessions",
    ],
  },
  {
    name: "Gold",
    price: "By discussion",
    color: "from-yellow-400/15 to-yellow-500/5",
    border: "border-yellow-500/25",
    badge: "text-yellow-400 bg-yellow-400/10",
    perks: [
      "Logo on website and event materials",
      "Acknowledgement in communications",
      "Speaker opportunity at one event",
      "Access to member profiles",
      "Annual impact report",
    ],
  },
  {
    name: "Silver",
    price: "By discussion",
    color: "from-slate-400/15 to-slate-500/5",
    border: "border-slate-500/25",
    badge: "text-slate-300 bg-slate-400/10",
    perks: [
      "Logo on website",
      "Acknowledgement in newsletters",
      "Mentions at OMSP events",
      "Annual impact summary",
    ],
  },
  {
    name: "Community Partner",
    price: "In-kind / flexible",
    color: "from-teal-400/15 to-teal-500/5",
    border: "border-teal-500/25",
    badge: "text-teal-400 bg-teal-400/10",
    perks: [
      "Logo on website partners page",
      "Acknowledgement at events",
      "Collaborative project opportunities",
    ],
  },
];

async function getSponsors(): Promise<Sponsor[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("sponsors")
      .select("*")
      .eq("is_active", true)
      .order("tier");
    return (data as Sponsor[]) ?? [];
  } catch {
    return [];
  }
}

export default async function PartnersPage() {
  const sponsors = await getSponsors();

  return (
    <div className="pt-24">

      {/* Hero */}
      <section className="py-20 bg-ocean-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/4 w-[500px] h-[300px] -translate-y-1/2
                          rounded-full bg-teal-500/6 blur-[80px]" />
        </div>
        <div className="section-container relative z-10">
          <span className="section-eyebrow">Partnerships</span>
          <h1 className="font-display text-5xl lg:text-6xl font-bold text-white max-w-3xl leading-tight">
            Invest in the Future<br />
            <span className="text-gradient-teal">of Ocean Science</span>
          </h1>
          <p className="mt-6 text-slate-300 max-w-2xl leading-relaxed text-lg">
            OMSP is building a generation of skilled, connected marine science professionals.
            Partner with us and place your organisation at the heart of that mission.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/contact" className="btn-primary px-8 py-3.5 text-base">
              Get in Touch
            </Link>
            <a href="mailto:team@omspglobal.org" className="btn-ghost px-8 py-3.5 text-base">
              team@omspglobal.org
            </a>
          </div>
        </div>
      </section>

      {/* Why partner */}
      <section className="py-20 bg-ocean-950">
        <div className="section-container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="section-eyebrow">Why OMSP</span>
            <h2 className="font-display text-4xl font-bold text-white">Why Partner With OMSP?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { stat: "Year 1",   label: "Structured Roadmap",    body: "A clear twelve-month program with defined milestones and measurable outcomes." },
              { stat: "Virtual",  label: "Global Reach",          body: "All programs are delivered online, open to members across institutions and borders." },
              { stat: "4",        label: "Core Pillars",          body: "Student engagement, skill development, career exposure, and community impact." },
              { stat: "Month 12", label: "Annual Conference",     body: "A virtual showcase event with student presentations and institutional recognition." },
            ].map(({ stat, label, body }) => (
              <div key={label} className="glass-card p-7">
                <span className="font-display text-3xl font-bold text-teal-400 block mb-1">{stat}</span>
                <span className="font-semibold text-white text-sm block mb-3">{label}</span>
                <p className="text-slate-400 text-xs leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsorship tiers */}
      <section className="py-20 bg-ocean-900">
        <div className="section-container">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="section-eyebrow">Sponsorship</span>
            <h2 className="font-display text-4xl font-bold text-white">Partnership Tiers</h2>
            <p className="mt-4 text-slate-400 text-sm">
              All partnerships are tailored to your organisation&apos;s goals. Contact us to discuss what works best.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`glass-card p-7 bg-gradient-to-b ${tier.color} border ${tier.border} flex flex-col`}
              >
                <span className={`self-start px-3 py-1 rounded-full text-xs font-semibold mb-5 ${tier.badge}`}>
                  {tier.name}
                </span>
                <p className="font-mono text-xs text-slate-500 mb-6">{tier.price}</p>
                <ul className="space-y-3 flex-1">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-slate-300 text-xs leading-relaxed">
                      <svg className="w-3.5 h-3.5 text-teal-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {perk}
                    </li>
                  ))}
                </ul>
                <Link href="/contact" className="mt-8 btn-ghost text-center text-xs py-2.5 justify-center">
                  Enquire
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current sponsors */}
      {sponsors.length > 0 && (
        <section className="py-16 bg-ocean-950">
          <div className="section-container">
            <p className="text-center text-slate-500 text-xs uppercase tracking-widest font-mono mb-10">
              Current Partners
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {sponsors.map((s) => (
                <a
                  key={s.id}
                  href={s.website_url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card px-10 py-6 hover:border-teal-500/30 transition-colors flex items-center justify-center min-w-[180px]"
                >
                  {s.logo_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={s.logo_url} alt={s.name} className="h-9 object-contain opacity-70 hover:opacity-100 transition-opacity" />
                    : <span className="text-slate-300 font-medium text-sm">{s.name}</span>
                  }
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
