import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  /** Inline SVG icon element */
  icon: React.ReactNode;
  accent?: "teal" | "sky" | "purple" | "orange";
  trend?: { value: number; label: string };
}

const accentMap = {
  teal:   { icon: "bg-teal-500/15 text-teal-400",   border: "hover:border-teal-500/30" },
  sky:    { icon: "bg-sky-500/15 text-sky-400",      border: "hover:border-sky-500/30"  },
  purple: { icon: "bg-purple-500/15 text-purple-400",border: "hover:border-purple-500/30"},
  orange: { icon: "bg-orange-500/15 text-orange-400",border: "hover:border-orange-500/30"},
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  accent = "teal",
  trend,
}: StatsCardProps) {
  const styles = accentMap[accent];

  return (
    <div className={cn("glass-card p-6 transition-all duration-200", styles.border)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-slate-400 text-xs font-mono uppercase tracking-wider mb-3">{title}</p>
          <p className="font-display text-3xl font-bold text-white leading-none">{value}</p>
          {subtitle && (
            <p className="text-slate-500 text-xs mt-1.5">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 mt-3">
              <span className={cn(
                "text-xs font-medium",
                trend.value >= 0 ? "text-teal-400" : "text-red-400"
              )}>
                {trend.value >= 0 ? "+" : ""}{trend.value}
              </span>
              <span className="text-slate-600 text-xs">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", styles.icon)}>
          {icon}
        </div>
      </div>
    </div>
  );
}
