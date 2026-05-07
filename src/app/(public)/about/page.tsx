import type { Metadata } from "next";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "About OMSP",
  description:
    "Learn about the Organization of Marine Science Professionals — our story, mission, and the community we are building.",
};

const VALUES = [
  {
    title: "Integrity",
    body: "We uphold the highest standards of scientific and professional integrity in everything we do.",
  },
  {
    title: "Inclusion",
    body: "OMSP is for every marine science student regardless of institution, geography, or background.",
  },
  {
    title: "Impact",
    body: "We measure our success by the real change our members create in their communities and careers.",
  },
  {
    title: "Collaboration",
    body: "We believe ocean challenges are best solved by professionals who work together.",
  },
];

async function getTeamMembers() {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("team_members")
    .select("id, name, role, image_url")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error loading team members:", error.message);
    return [];
  }

  return data || [];
}

export default async function AboutPage() {
  const teamMembers = await getTeamMembers();

  return (
    <div className="pt-24">
      <section className="relative overflow-hidden bg-ocean-900 py-20">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
        </div>

        <div className="section-container">
          <span className="section-eyebrow">Who We Are</span>

          <h1 className="max-w-3xl font-display text-5xl font-bold leading-tight text-white lg:text-6xl">
            About the Organization of Marine Science Professionals
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            OMSP is a professional community dedicated to empowering marine science students
            and early-career professionals through structured programs, meaningful networks,
            and community-driven impact.
          </p>
        </div>
      </section>

      <section className="bg-ocean-950 py-20">
        <div className="section-container">
          <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
            <div>
              <span className="section-eyebrow">Our Story</span>

              <h2 className="mb-6 font-display text-3xl font-bold text-white">
                Built by Marine Scientists, for Marine Scientists
              </h2>

              <div className="space-y-4 leading-relaxed text-slate-300">
                <p>
                  OMSP was born from a simple observation: marine science graduates are among
                  the most passionate professionals in any field, yet they often enter the
                  workforce without the networks, practical tools, or career guidance they need.
                </p>

                <p>
                  We set out to change that. A structured organisation with a clear one-year
                  roadmap, real programs, and a committed team. OMSP bridges the gap between
                  academic training and professional readiness.
                </p>

                <p>
                  From webinars and workshops to a virtual annual conference, everything we do
                  is designed to give members a genuine competitive advantage and build a
                  generation of connected, skilled, impact-driven ocean professionals.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {VALUES.map(({ title, body }) => (
                <div key={title} className="glass-card flex gap-4 p-6">
                  <div className="w-1 flex-shrink-0 self-stretch rounded-full bg-teal-500" />

                  <div>
                    <h3 className="mb-1 font-display font-bold text-white">
                      {title}
                    </h3>

                    <p className="text-sm leading-relaxed text-slate-400">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ocean-900 py-20">
        <div className="section-container">
          <span className="section-eyebrow">Leadership</span>

          <h2 className="mb-3 font-display text-3xl font-bold text-white">
            The Team
          </h2>

          <p className="mb-10 max-w-lg text-sm text-slate-400">
            OMSP is led by a dedicated team of marine science professionals and students.
          </p>

          {teamMembers.length === 0 ? (
            <div className="glass-card p-8 text-center text-slate-400">
              Team members will appear here soon.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="glass-card group p-5 text-center transition-all hover:border-teal-500/30"
                >
                  <div className="relative mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border-2 border-ocean-700">
                    {member.image_url ? (
                      <Image
                        src={member.image_url}
                        alt={member.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-ocean-800 text-xs text-slate-500">
                        No image
                      </div>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-white">
                    {member.name}
                  </h3>

                  <p className="mt-1 text-xs leading-snug text-teal-300">
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}