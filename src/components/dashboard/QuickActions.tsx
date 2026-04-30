import Link from "next/link";

const ACTIONS = [
  {
    label: "Create Form",
    href: "/admin/forms/new",
    description: "Build a new application form",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
    accent: "teal",
  },
  {
    label: "Add Event",
    href: "/admin/events/new",
    description: "Schedule a new event",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
      </svg>
    ),
    accent: "sky",
  },
  {
    label: "View Submissions",
    href: "/admin/submissions",
    description: "Review all form responses",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
      </svg>
    ),
    accent: "purple",
  },
  {
    label: "Manage Sponsors",
    href: "/admin/sponsors",
    description: "Add or update partner info",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
    accent: "orange",
  },
] as const;

const accentStyles: Record<string, string> = {
  teal:   "bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20",
  sky:    "bg-sky-500/10 text-sky-400 group-hover:bg-sky-500/20",
  purple: "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20",
  orange: "bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20",
};

export default function QuickActions() {
  return (
    <div className="glass-card p-6">
      <h3 className="font-display font-bold text-white mb-5">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex flex-col gap-3 p-4 rounded-xl bg-ocean-800/50
                       hover:bg-ocean-800 border border-ocean-700/40 hover:border-ocean-600/60
                       transition-all duration-150"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${accentStyles[action.accent]}`}>
              {action.icon}
            </div>
            <div>
              <p className="text-white text-sm font-medium leading-snug">{action.label}</p>
              <p className="text-slate-500 text-xs mt-0.5 leading-snug">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
