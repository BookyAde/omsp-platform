import Link from "next/link";
import Logo from "./Logo";
import { SITE_FULL_NAME } from "@/lib/constants";

const FOOTER_LINKS = {
  Organisation: [
    { label: "About OMSP", href: "/about" },
    { label: "Programs", href: "/programs" },
    { label: "Events", href: "/events" },
    { label: "Partners", href: "/partners" },
  ],
  "Get Involved": [
    { label: "Opportunities", href: "/opportunities" },
    { label: "Contact Us", href: "/contact" },
  ],
  Contact: [
    { label: "support@omspglobal.org", href: "mailto:support@omspglobal.org" },
    { label: "team@omspglobal.org", href: "mailto:team@omspglobal.org" },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-ocean-800/50 bg-ocean-900">
      <div className="section-container py-14 lg:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-2">
            <Logo size="lg" linked />

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300/75">
              Building a strong network of marine science students and
              professionals engaged in ocean sustainability, learning, and
              community impact.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {[
                { label: "LinkedIn", href: "#", abbr: "in" },
                { label: "WhatsApp", href: "#", abbr: "wa" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-ocean-700/50 bg-ocean-800/70 font-mono text-xs text-slate-400 transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-400/30 hover:bg-ocean-700/70 hover:text-teal-300"
                  aria-label={social.label}
                >
                  {social.abbr}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="mb-4 text-sm font-semibold tracking-tight text-white">
                {heading}
              </h3>

              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm leading-6 text-slate-400 transition-colors duration-200 hover:text-teal-300"
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

      <div className="border-t border-ocean-800/40">
        <div className="section-container flex flex-col items-center justify-between gap-3 py-4 sm:flex-row">
          <p className="text-xs text-slate-500">
            &copy; {year} {SITE_FULL_NAME}. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-xs text-slate-500 transition-colors hover:text-slate-300"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="text-xs text-slate-500 transition-colors hover:text-slate-300"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}