export default function VisionSection() {
  return (
    <section className="py-24 bg-ocean-950 relative overflow-hidden">

      {/* Subtle dividing accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16
                      bg-gradient-to-b from-teal-500/60 to-transparent" aria-hidden="true" />

      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left — text */}
          <div>
            <span className="section-eyebrow">Our Purpose</span>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-white leading-tight">
              A Network Built on{" "}
              <span className="text-gradient-teal">Science,</span>
              <br />
              Community, and Impact
            </h2>
            <p className="mt-6 text-slate-300 leading-relaxed">
              OMSP was founded to bridge the gap between academic marine science and
              real-world professional practice. We exist to ensure that every marine science
              student has access to the networks, skills, and opportunities they deserve.
            </p>
            <p className="mt-4 text-slate-400 leading-relaxed text-sm">
              From career guidance to technical skill development, from community initiatives
              to institutional partnerships — OMSP is where marine science professionals are made.
            </p>
          </div>

          {/* Right — vision / mission cards */}
          <div className="space-y-4">
            <div className="glass-card p-8 group hover:border-teal-500/30 transition-colors duration-200">
              <div className="w-10 h-10 rounded-lg bg-teal-500/15 flex items-center justify-center mb-5
                              group-hover:bg-teal-500/25 transition-colors">
                <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">Our Vision</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                To build a strong, globally-connected network of marine science students
                and professionals, actively engaged in ocean sustainability and
                evidence-based community impact.
              </p>
            </div>

            <div className="glass-card p-8 group hover:border-teal-500/30 transition-colors duration-200">
              <div className="w-10 h-10 rounded-lg bg-ocean-400/10 flex items-center justify-center mb-5
                              group-hover:bg-ocean-400/20 transition-colors">
                <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">Our Mission</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                To provide marine science students and early-career professionals with
                structured pathways for skill development, career exposure, and
                meaningful community engagement — from kickoff to conference.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
