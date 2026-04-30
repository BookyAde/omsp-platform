import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?:  "sm" | "md" | "lg";
  className?: string;
}

const sizeMap: Record<string, string> = {
  sm: "w-4 h-4 border-[1.5px]",
  md: "w-6 h-6 border-2",
  lg: "w-10 h-10 border-[3px]",
};

export default function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block rounded-full border-teal-500/20 border-t-teal-500 animate-spin",
        sizeMap[size],
        className
      )}
    />
  );
}

/** Full-page loading state */
export function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ocean-950">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-slate-500 text-sm font-mono">Loading...</p>
      </div>
    </div>
  );
}
