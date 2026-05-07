import { ROADMAP_MILESTONES } from "@/lib/constants";

export default function RoadmapSection() {
  return (
    <section className="relative overflow-hidden bg-ocean-950 py-24 md:py-28">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400/5 blur-[120px]" />
      </div>

      <div className="section-container relative z-10">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="section-eyebrow">Year 1 Plan</span>

          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
            The OMSP roadmap
          </h2>

          <p className="mt-5 text-base leading-8 text-slate-300/80">
            A structured twelve-month journey from community launch to annual
            conference, with clear milestones for learning, engagement, and
            professional growth.
          </p>
        </div>

        <div className="relative">
          <div
            className="absolute left-0 right-0 top-[52px] hidden h-px bg-gradient-to-r from-transparent via-ocean-700/60 to-transparent lg:block"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-4">
            {ROADMAP_MILESTONES.map((milestone, idx) => (
              <div key={milestone.month} className="group relative">
                {idx < ROADMAP_MILESTONES.length - 1 && (
                  <div
                    className="absolute left-5 top-10 h-full w-px bg-ocean-700/40 lg:hidden"
                    aria-hidden="true"
                  />
                )}

                <div className="relative z-10 mx-auto mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-ocean-600/70 bg-ocean-800 transition-all duration-300 group-hover:border-teal-400/50 group-hover:shadow-teal-glow lg:mx-0">
                  <span className="font-mono text-[10px] font-medium text-teal-300">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="glass-card p-5 transition-colors duration-200 group-hover:border-teal-400/20">
                  <span className="mb-2 block font-mono text-xs text-teal-300/90">
                    {milestone.month}
                  </span>

                  <h3 className="font-display text-base font-semibold tracking-tight text-white">
                    {milestone.title}
                  </h3>

                  <ul className="mt-4 space-y-2.5">
                    {milestone.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-xs leading-6 text-slate-300/75"
                      >
                        <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-teal-300/80" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card mt-12 border-dashed border-ocean-600/40 p-6 md:p-8">
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <span className="mb-2 block font-mono text-xs text-slate-500">
                Year 2 and Beyond
              </span>

              <h3 className="font-display text-xl font-semibold tracking-tight text-white">
                Expanding our reach
              </h3>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300/80">
                Campus representatives, secondary school outreach, coastal field
                trips, internship guidance, and a growing network of
                early-career speakers.
              </p>
            </div>

            <span className="inline-flex flex-shrink-0 items-center rounded-xl border border-ocean-600/50 px-5 py-2.5 text-sm font-medium text-slate-400">
              Coming soon
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}