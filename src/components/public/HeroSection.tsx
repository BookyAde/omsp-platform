import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-hero-gradient">

      {/* Background depth layers */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2
                        rounded-full bg-teal-500/8 blur-[120px]" />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] -translate-y-1/2
                        rounded-full bg-ocean-400/10 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(45,212,191,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.6) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-48
                        bg-gradient-to-t from-ocean-950 to-transparent" />
      </div>

      <div className="section-container relative z-10 pt-28 pb-20 lg:pt-36 lg:pb-28">
        <div className="max-w-4xl">

          <span className="section-eyebrow animate-fade-up" style={{ animationDelay: "0.05s", animationFillMode: "both" }}>
            Organization of Marine Science Professionals
          </span>

          <h1
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight
                       text-white animate-fade-up"
            style={{ animationDelay: "0.15s", animationFillMode: "both" }}
          >
            Advancing{" "}
            <span className="text-gradient-teal">Ocean Science</span>
            <br />
            One Professional
            <br />
            at a Time
          </h1>

          <p
            className="mt-6 text-slate-300 text-lg md:text-xl leading-relaxed max-w-2xl animate-fade-up"
            style={{ animationDelay: "0.28s", animationFillMode: "both" }}
          >
            OMSP connects marine science students and professionals across institutions,
            providing structured pathways to skills, careers, and community impact in
            ocean sustainability.
          </p>

          <div
            className="mt-10 flex flex-wrap items-center gap-4 animate-fade-up"
            style={{ animationDelay: "0.40s", animationFillMode: "both" }}
          >
            <Link href="/opportunities" className="btn-primary px-8 py-3.5 text-base">
              Explore Opportunities
            </Link>
            <Link href="/about" className="btn-ghost px-8 py-3.5 text-base">
              About OMSP
            </Link>
          </div>

          {/* Core pillars — factual, no fake numbers */}
          <div
            className="mt-14 flex flex-wrap items-center gap-8 animate-fade-up"
            style={{ animationDelay: "0.52s", animationFillMode: "both" }}
          >
            {[
              { value: "Year 1",      label: "Structured Roadmap" },
              { value: "Virtual",     label: "Global Community"   },
              { value: "Free",        label: "For Members"        },
              { value: "Month 12",    label: "Annual Conference"  },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col">
                <span className="font-display text-2xl font-bold text-teal-400">{value}</span>
                <span className="text-slate-400 text-xs mt-0.5 uppercase tracking-widest font-mono">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative right-side element */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[420px] h-[420px]
                   opacity-10 pointer-events-none hidden xl:block"
        aria-hidden="true"
      >
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          {[0, 40, 80, 120, 160, 200].map((offset) => (
            <ellipse
              key={offset}
              cx="200" cy="200"
              rx={80 + offset} ry={40 + offset * 0.5}
              stroke="#2dd4bf"
              strokeWidth="1"
              transform={`rotate(${offset * 0.3} 200 200)`}
            />
          ))}
        </svg>
      </div>
    </section>
  );
}
