"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { PUBLIC_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-ocean-950/95 backdrop-blur-md border-b border-ocean-800/70 shadow-ocean-lg"
          : "bg-transparent"
      )}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Logo size="md" />

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {PUBLIC_NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                    active
                      ? "text-teal-400 bg-teal-500/10"
                      : "text-slate-300 hover:text-white hover:bg-ocean-800/60"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/opportunities" className="btn-primary text-sm px-5 py-2.5">
              Apply Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-ocean-800/60 transition-colors"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span className="block w-5 h-px bg-current mb-1.5 transition-all duration-200" style={{ transform: menuOpen ? "translateY(6px) rotate(45deg)" : "none" }} />
            <span className="block w-5 h-px bg-current mb-1.5 transition-all duration-200" style={{ opacity: menuOpen ? 0 : 1 }} />
            <span className="block w-5 h-px bg-current transition-all duration-200" style={{ transform: menuOpen ? "translateY(-6px) rotate(-45deg)" : "none" }} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden transition-all duration-300 overflow-hidden",
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav
          className="section-container pb-6 pt-2 border-t border-ocean-800/50 flex flex-col gap-1"
          aria-label="Mobile navigation"
        >
          {PUBLIC_NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-150",
                  active
                    ? "text-teal-400 bg-teal-500/10"
                    : "text-slate-300 hover:text-white hover:bg-ocean-800/60"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <Link href="/opportunities" className="btn-primary mt-2 justify-center">
            Apply Now
          </Link>
        </nav>
      </div>
    </header>
  );
}
