const PILLARS = [
  {
    number: "01",
    title: "Student Engagement",
    description:
      "Building an active and connected community of marine science students through webinars, discussions, and collaborative initiatives across institutions.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.6}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
        />
      </svg>
    ),
    accent: "teal",
  },
  {
    number: "02",
    title: "Skill Development",
    description:
      "Structured training in GIS for marine applications, ocean data analysis, Python, and other technical competencies relevant to modern marine industries.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.6}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
        />
      </svg>
    ),
    accent: "sky",
  },
  {
    number: "03",
    title: "Career Exposure",
    description:
      "Connecting members with mentors, professionals, and employers through workshops, networking sessions, and speaker engagements.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.6}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"
        />
      </svg>
    ),
    accent: "teal",
  },
  {
    number: "04",
    title: "Community Impact",
    description:
      "Driving meaningful change through sustainability initiatives, outreach programs, coastal awareness campaigns, and conservation projects.",
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.6}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
        />
      </svg>
    ),
    accent: "sky",
  },
];

const accentStyles: Record<string, string> = {
  teal:
    "bg-teal-400/10 text-teal-300 group-hover:bg-teal-400/15",
  sky:
    "bg-sky-400/10 text-sky-300 group-hover:bg-sky-400/15",
};

const borderStyles: Record<string, string> = {
  teal: "group-hover:border-teal-400/20",
  sky: "group-hover:border-sky-400/20",
};

export default function PillarsSection() {
  return (
    <section className="bg-ocean-900 py-24 md:py-28">
      <div className="section-container">
        <div className="mb-14 max-w-2xl">
          <span className="section-eyebrow">What We Do</span>

          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
            Four pillars of{" "}
            <span className="text-gradient-teal">
              professional growth
            </span>
          </h2>

          <p className="mt-6 text-base leading-8 text-slate-300/85 md:text-lg">
            Every OMSP initiative is built around these interconnected
            pillars, each designed to support the growth of well-rounded
            and impactful marine science professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.number}
              className={`glass-card group p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-ocean-lg md:p-8 ${borderStyles[pillar.accent]}`}
            >
              <span className="mb-5 block font-mono text-[11px] tracking-[0.2em] text-slate-500">
                {pillar.number}
              </span>

              <div
                className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-200 ${accentStyles[pillar.accent]}`}
              >
                {pillar.icon}
              </div>

              <h3 className="font-display text-lg font-semibold tracking-tight text-white">
                {pillar.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-300/80 md:text-[15px]">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}