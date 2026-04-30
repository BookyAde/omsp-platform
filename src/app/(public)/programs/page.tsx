import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Programs",
  description: "OMSP programs in GIS, ocean data analysis, career development, and community impact.",
};

const PROGRAMS = [
  {
    month: "Month 1",
    category: "Kickoff",
    title: "Career Pathways Webinar",
    description:
      "An in-depth webinar exploring diverse career options for marine science graduates. Industry professionals and academics share their journeys and answer your questions.",
    format: "Virtual Webinar",
    duration: "2 hours",
    accent: "teal",
  },
  {
    month: "Month 3",
    category: "Skill Development",
    title: "GIS for Marine Applications",
    description:
      "Hands-on training in ArcGIS and QGIS for marine spatial analysis. Learn to map habitats, analyse coastal change, and produce publication-quality figures.",
    format: "Virtual Workshop",
    duration: "2 days",
    accent: "sky",
  },
  {
    month: "Month 3",
    category: "Skill Development",
    title: "Ocean Data Analysis",
    description:
      "Practical data analysis using Python (pandas, matplotlib, xarray) and Excel for oceanographic and fisheries datasets. Track selection available.",
    format: "Virtual Workshop",
    duration: "2 days",
    accent: "sky",
  },
  {
    month: "Month 6",
    category: "Career Exposure",
    title: "CV & LinkedIn Workshop",
    description:
      "Build a compelling academic and professional CV tailored to the marine science job market. Receive personalised feedback and LinkedIn optimisation tips.",
    format: "Virtual Workshop",
    duration: "3 hours",
    accent: "purple",
  },
  {
    month: "Month 9",
    category: "Career Exposure",
    title: "Cover Letter, SOP & Cold Email Masterclass",
    description:
      "Learn to write persuasive cover letters, statements of purpose for postgraduate applications, and effective cold emails to researchers and employers.",
    format: "Virtual Workshop",
    duration: "3 hours",
    accent: "purple",
  },
  {
    month: "Month 12",
    category: "Annual Conference",
    title: "OMSP Virtual Conference",
    description:
      "Our flagship annual event. Student presentations on marine science topics, networking sessions, keynote speakers, and a prize for the best presentation.",
    format: "Virtual Conference",
    duration: "Full day",
    accent: "teal",
  },
];

const accentMap: Record<string, { border: string; badge: string; dot: string }> = {
  teal:   { border: "hover:border-teal-500/30",   badge: "text-teal-400 bg-teal-500/10",   dot: "bg-teal-400"   },
  sky:    { border: "hover:border-sky-500/30",     badge: "text-sky-400 bg-sky-500/10",     dot: "bg-sky-400"    },
  purple: { border: "hover:border-purple-500/30",  badge: "text-purple-400 bg-purple-500/10", dot: "bg-purple-400" },
};

export default function ProgramsPage() {
  return (
    <div className="pt-24">

      {/* Hero */}
      <section className="py-20 bg-ocean-900">
        <div className="section-container">
          <span className="section-eyebrow">Training & Development</span>
          <h1 className="font-display text-5xl lg:text-6xl font-bold text-white max-w-3xl leading-tight">
            OMSP Programs
          </h1>
          <p className="mt-6 text-slate-300 max-w-2xl leading-relaxed text-lg">
            A structured year-long curriculum covering technical skills, career readiness,
            and community leadership for marine science students and professionals.
          </p>
          <div className="mt-8">
            <Link href="/opportunities" className="btn-primary px-8 py-3.5 text-base">
              View Open Applications
            </Link>
          </div>
        </div>
      </section>

      {/* Programs grid */}
      <section className="py-20 bg-ocean-950">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROGRAMS.map((prog) => {
              const styles = accentMap[prog.accent];
              return (
                <div
                  key={`${prog.month}-${prog.title}`}
                  className={`glass-card p-7 flex flex-col transition-all duration-200 hover:-translate-y-0.5 ${styles.border}`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
                    <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">
                      {prog.month}
                    </span>
                  </div>
                  <span className={`self-start text-xs font-medium px-2.5 py-1 rounded-full mb-4 ${styles.badge}`}>
                    {prog.category}
                  </span>
                  <h3 className="font-display text-lg font-bold text-white mb-3 leading-snug">
                    {prog.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed flex-1">
                    {prog.description}
                  </p>
                  <div className="mt-6 pt-5 border-t border-ocean-700/40 flex items-center gap-4 text-xs text-slate-500 font-mono">
                    <span>{prog.format}</span>
                    <span className="text-ocean-700">·</span>
                    <span>{prog.duration}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Year 2 teaser */}
      <section className="py-16 bg-ocean-900">
        <div className="section-container">
          <div className="glass-card p-8 lg:p-10 border-dashed border-ocean-600/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <span className="section-eyebrow">Coming in Year 2</span>
              <h2 className="font-display text-2xl font-bold text-white">Expanding the Curriculum</h2>
              <p className="text-slate-400 text-sm mt-2 max-w-xl">
                Secondary school outreach, coastal field trips, internship guidance, academic discussion
                forums, early-career speaker engagements, and beach awareness campaigns.
              </p>
            </div>
            <Link href="/contact" className="btn-ghost flex-shrink-0">Stay in Touch</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
