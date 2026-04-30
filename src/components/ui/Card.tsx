import { cn } from "@/lib/utils";

interface CardProps {
  children:  React.ReactNode;
  className?: string;
  /** Adds a coloured left border accent */
  accent?:   "teal" | "sky" | "purple" | "orange" | "red";
  hover?:    boolean;
  padding?:  "none" | "sm" | "md" | "lg";
}

const accentBorder: Record<string, string> = {
  teal:   "border-l-4 border-l-teal-500",
  sky:    "border-l-4 border-l-sky-500",
  purple: "border-l-4 border-l-purple-500",
  orange: "border-l-4 border-l-orange-500",
  red:    "border-l-4 border-l-red-500",
};

const paddingMap: Record<string, string> = {
  none: "",
  sm:   "p-4",
  md:   "p-6",
  lg:   "p-8",
};

export default function Card({
  children,
  className,
  accent,
  hover = false,
  padding = "md",
}: CardProps) {
  return (
    <div
      className={cn(
        "glass-card",
        paddingMap[padding],
        accent && accentBorder[accent],
        hover && "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-ocean-lg hover:border-ocean-600/70",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Convenience sub-components */
export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between mb-5", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("font-display font-bold text-white", className)}>
      {children}
    </h3>
  );
}

export function CardDivider() {
  return <hr className="border-ocean-700/40 my-5" />;
}
