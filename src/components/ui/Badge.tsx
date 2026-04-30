import { cn } from "@/lib/utils";

type BadgeVariant = "teal" | "sky" | "purple" | "orange" | "red" | "slate" | "green";

interface BadgeProps {
  children:  React.ReactNode;
  variant?:  BadgeVariant;
  dot?:      boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  teal:   "bg-teal-500/15 text-teal-400 border-teal-500/20",
  sky:    "bg-sky-500/15 text-sky-400 border-sky-500/20",
  purple: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  orange: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  red:    "bg-red-500/15 text-red-400 border-red-500/20",
  slate:  "bg-slate-700/60 text-slate-300 border-slate-600/30",
  green:  "bg-green-500/15 text-green-400 border-green-500/20",
};

const dotStyles: Record<BadgeVariant, string> = {
  teal:   "bg-teal-400",
  sky:    "bg-sky-400",
  purple: "bg-purple-400",
  orange: "bg-orange-400",
  red:    "bg-red-400",
  slate:  "bg-slate-400",
  green:  "bg-green-400",
};

export default function Badge({
  children,
  variant = "slate",
  dot     = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full",
        "text-xs font-medium border",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotStyles[variant])} />
      )}
      {children}
    </span>
  );
}
