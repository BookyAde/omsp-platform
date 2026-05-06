import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  linked?: boolean;
}

const sizeMap = {
  sm: {
    icon: "h-8 w-8",
    title: "text-sm",
  },
  md: {
    icon: "h-10 w-10",
    title: "text-base",
  },
  lg: {
    icon: "h-12 w-12",
    title: "text-lg",
  },
};

export default function Logo({
  size = "md",
  className,
  linked = true,
}: LogoProps) {
  const styles = sizeMap[size];

  const content = (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Image
        src="/images/omsp-mark.png"
        alt="OMSP Logo"
        width={48}
        height={48}
        priority
        className={cn(styles.icon, "object-contain")}
      />

      <span className="hidden sm:flex flex-col leading-tight">
        <span className={cn("font-bold text-white tracking-wide", styles.title)}>
          OMSP
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">
          Marine Science
        </span>
      </span>
    </span>
  );

  if (!linked) return content;

  return (
    <Link
      href="/"
      className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded"
    >
      {content}
    </Link>
  );
}