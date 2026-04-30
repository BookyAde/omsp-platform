import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "ghost" | "danger" | "subtle";
type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  loading?:  boolean;
  /** Icon shown before the label */
  iconLeft?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-teal-500 hover:bg-teal-400 text-white shadow-teal-glow hover:shadow-[0_0_32px_rgba(45,212,191,0.4)] border border-transparent",
  ghost:
    "bg-transparent border border-ocean-600 hover:border-teal-500 text-slate-300 hover:text-white",
  danger:
    "bg-transparent border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-white hover:bg-red-500/10",
  subtle:
    "bg-ocean-800/60 hover:bg-ocean-700/60 border border-ocean-700/40 hover:border-ocean-600 text-slate-300 hover:text-white",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export default function Button({
  variant  = "primary",
  size     = "md",
  loading  = false,
  iconLeft,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
        "transition-all duration-200 active:scale-[0.98]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 rounded-full border-2 border-current/30 border-t-current animate-spin" />
      ) : (
        iconLeft
      )}
      {children}
    </button>
  );
}
