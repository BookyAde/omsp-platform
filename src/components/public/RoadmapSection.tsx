import { ROADMAP_MILESTONES } from "@/lib/constants";

export default function RoadmapSection() {
  return (
    <section className="py-24 bg-ocean-950 relative overflow-hidden">

      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[800px] h-[400px] rounded-full
                        bg-teal-500/4 blur-[100px]" />
      </div>

      <div className="section-container relative z-10">

        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="section-eyebrow">Year 1 Plan</span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white leading-tight">
            The OMSP Roadmap
          </h2>
          <p className="mt-5 text-slate-400 leading-relaxed">
            A structured twelve-month journey from community launch to annual conference —
            with clear milestones at every stage.
          </p>
        </div>

        {/* Timeline — horizontal on large, vertical on mobile */}
        <div className="relative">

          {/* Connector line — desktop */}
          <div
            className="hidden lg:block absolute top-[52px] left-0 right-0 h-px bg-gradient-to-r
                        from-transparent via-ocean-700 to-transparent"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-4">
            {ROADMAP_MILESTONES.map((milestone, idx) => (
              <div key={milestone.month} className="relative group">

                {/* Mobile connector — vertical */}
                {idx < ROADMAP_MILESTONES.length - 1 && (
                  <div className="lg:hidden absolute left-5 top-10 w-px h-full bg-ocean-700/50" aria-hidden="true" />
                )}

                {/* Dot */}
                <div className="relative z-10 w-10 h-10 rounded-full
                                bg-ocean-800 border-2 border-ocean-600
                                group-hover:border-teal-500 group-hover:shadow-teal-glow
                                transition-all duration-300 flex items-center justify-center
                                mx-auto lg:mx-0 mb-5">
                  <span className="font-mono text-[10px] text-teal-400 font-bold">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Card */}
                <div className="glass-card p-5 group-hover:border-teal-500/25 transition-colors duration-200">
                  <span className="font-mono text-xs text-teal-400 mb-1 block">
                    {milestone.month}
                  </span>
                  <h3 className="font-display text-base font-bold text-white mb-3">
                    {milestone.title}
                  </h3>
                  <ul className="space-y-2">
                    {milestone.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-slate-400 text-xs leading-relaxed">
                        <span className="w-1 h-1 rounded-full bg-teal-500 mt-1.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Year 2+ teaser */}
        <div className="mt-12 glass-card p-6 lg:p-8 border-dashed border-ocean-600/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-xs text-slate-500 block mb-1">Year 2 and Beyond</span>
              <h3 className="font-display text-xl font-bold text-white">Expanding Our Reach</h3>
              <p className="text-slate-400 text-sm mt-2">
                Campus representatives, secondary school outreach, coastal field trips,
                internship guidance, and a growing network of early-career speakers.
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                               border border-ocean-600/60 text-slate-400 text-sm font-medium">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
