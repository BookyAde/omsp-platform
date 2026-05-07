export default function VisionSection() {
  return (
    <section className="relative overflow-hidden bg-ocean-950 py-24 md:py-28">
      <div
        className="absolute top-0 left-1/2 h-16 w-px -translate-x-1/2 bg-gradient-to-b from-teal-400/40 to-transparent"
        aria-hidden="true"
      />

      <div className="section-container">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-24">
          <div>
            <span className="section-eyebrow">Our Purpose</span>

            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
              A network built on{" "}
              <span className="text-gradient-teal">science,</span>
              <br />
              community, and impact
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300/90 md:text-lg">
              OMSP was founded to bridge the gap between academic marine science
              and real-world professional practice. We exist to help marine
              science students access the networks, skills, and opportunities
              they need to grow with confidence.
            </p>

            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400/90 md:text-base">
              From career guidance to technical skill development, community
              initiatives, and institutional partnerships, OMSP is creating a
              practical space where marine science professionals can learn,
              connect, and contribute meaningfully.
            </p>
          </div>

          <div className="space-y-5">
            <div className="glass-card group p-7 transition-colors duration-200 hover:border-teal-400/25 md:p-8">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400/10 transition-colors group-hover:bg-teal-400/15">
                <svg
                  className="h-5 w-5 text-teal-300"
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
              </div>

              <h3 className="font-display text-xl font-semibold tracking-tight text-white">
                Our Vision
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-300/85 md:text-base">
                To build a strong, globally connected network of marine science
                students and professionals who are actively engaged in ocean
                sustainability and evidence-based community impact.
              </p>
            </div>

            <div className="glass-card group p-7 transition-colors duration-200 hover:border-teal-400/25 md:p-8">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-ocean-400/10 transition-colors group-hover:bg-ocean-400/15">
                <svg
                  className="h-5 w-5 text-sky-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.7}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </div>

              <h3 className="font-display text-xl font-semibold tracking-tight text-white">
                Our Mission
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-300/85 md:text-base">
                To provide marine science students and early-career
                professionals with structured pathways for skill development,
                career exposure, and meaningful community engagement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}