import Link from "next/link";
import Logo from "./Logo";
import { PUBLIC_NAV, SITE_FULL_NAME } from "@/lib/constants";

const FOOTER_LINKS = {
  Organisation: [
    { label: "About OMSP",    href: "/about" },
    { label: "Programs",      href: "/programs" },
    { label: "Events",        href: "/events" },
    { label: "Partners",      href: "/partners" },
  ],
  "Get Involved": [
    { label: "Opportunities", href: "/opportunities" },
    { label: "Contact Us",    href: "/contact" },
  ],
  Contact: [
    { label: "support@omsp.org", href: "mailto:support@omsp.org" },
    { label: "team@omsp.org",    href: "mailto:team@omsp.org" },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ocean-900 border-t border-ocean-800/60">

      {/* Main footer content */}
      <div className="section-container py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Logo size="lg" linked />
            <p className="mt-5 text-slate-400 text-sm leading-relaxed max-w-xs">
              Building a strong network of marine science students and professionals,
              engaged in ocean sustainability and community impact.
            </p>

            {/* Social links — placeholders */}
            <div className="mt-6 flex items-center gap-3">
              {[
                { label: "LinkedIn", href: "#", abbr: "in" },
                { label: "WhatsApp", href: "#", abbr: "wa" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-9 h-9 rounded-lg bg-ocean-800 hover:bg-ocean-700 border border-ocean-700/50
                             hover:border-teal-500/50 flex items-center justify-center
                             text-slate-400 hover:text-teal-400 transition-all duration-200 text-xs font-mono"
                  aria-label={social.label}
                >
                  {social.abbr}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-white font-semibold text-sm mb-4">{heading}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-teal-400 text-sm transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-ocean-800/40">
        <div className="section-container py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-xs">
            &copy; {year} {SITE_FULL_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
