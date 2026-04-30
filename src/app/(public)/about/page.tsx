import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About OMSP",
  description:
    "Learn about the Organization of Marine Science Professionals — our story, mission, and the community we are building.",
};

const TEAM_ROLES = [
  "President",
  "Vice President",
  "Head of Programs",
  "Head of Community",
  "Communications Lead",
  "Partnerships Lead",
];

const VALUES = [
  { title: "Integrity",     body: "We uphold the highest standards of scientific and professional integrity in everything we do." },
  { title: "Inclusion",     body: "OMSP is for every marine science student regardless of institution, geography, or background." },
  { title: "Impact",        body: "We measure our success by the real change our members create in their communities and careers." },
  { title: "Collaboration", body: "We believe the ocean challenges are best solved by professionals who work together." },
];

export default function AboutPage() {
  return (
    <div className="pt-24">
      <section className="py-20 bg-ocean-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
        </div>
        <div className="section-container">
          <span className="section-eyebrow">Who We Are</span>
          <h1 className="font-display text-5xl lg:text-6xl font-bold text-white max-w-3xl leading-tight">
            About the Organization of Marine Science Professionals
          </h1>
          <p className="mt-6 text-slate-300 max-w-2xl leading-relaxed text-lg">
            OMSP is a professional community dedicated to empowering marine science students
            and early-career professionals through structured programs, meaningful networks,
            and community-driven impact.
          </p>
        </div>
      </section>

      <section className="py-20 bg-ocean-950">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <span className="section-eyebrow">Our Story</span>
              <h2 className="font-display text-3xl font-bold text-white mb-6">
                Built by Marine Scientists, for Marine Scientists
              </h2>
              <div className="space-y-4 text-slate-300 leading-relaxed">
                <p>
                  OMSP was born from a simple observation: marine science graduates are among
                  the most passionate professionals in any field, yet they often enter the
                  workforce without the networks, practical tools, or career guidance they need.
                </p>
                <p>
                  We set out to change that. A structured organisation with a clear one-year
                  roadmap, real programs, and a committed team — OMSP bridges the gap between
                  academic training and professional readiness.
                </p>
                <p>
                  From webinars and workshops to a virtual annual conference, everything we do
                  is designed to give members a genuine competitive advantage and to build a
                  generation of connected, skilled, impact-driven ocean professionals.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {VALUES.map(({ title, body }) => (
                <div key={title} className="glass-card p-6 flex gap-4">
                  <div className="w-1 rounded-full bg-teal-500 flex-shrink-0 self-stretch" />
                  <div>
                    <h3 className="font-display font-bold text-white mb-1">{title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-ocean-900">
        <div className="section-container">
          <span className="section-eyebrow">Leadership</span>
          <h2 className="font-display text-3xl font-bold text-white mb-3">The Team</h2>
          <p className="text-slate-400 text-sm mb-10 max-w-lg">
            OMSP is led by a dedicated team of marine science professionals and students.
            Team profiles will be published here shortly.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {TEAM_ROLES.map((role) => (
              <div key={role} className="glass-card p-5 text-center hover:border-teal-500/30 transition-colors">
                <div className="w-14 h-14 rounded-full bg-ocean-700 border-2 border-ocean-600 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
                <p className="font-medium text-slate-300 text-xs leading-snug">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
