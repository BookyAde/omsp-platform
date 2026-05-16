import type { Metadata } from "next";
import { Suspense } from "react";
import {
  Playfair_Display,
  DM_Sans,
  JetBrains_Mono,
} from "next/font/google";

import "./globals.css";

import {
  SITE_FULL_NAME,
  SITE_DESCRIPTION,
  SITE_URL,
} from "@/lib/constants";

import { ToastProvider } from "@/components/ui/Toast";
import PublicActivityTracker from "@/components/monitoring/PublicActivityTracker";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: `OMSP — ${SITE_FULL_NAME}`,
    template: "%s | OMSP",
  },

  description: SITE_DESCRIPTION,

  metadataBase: new URL(SITE_URL),

  openGraph: {
    type: "website",
    siteName: "OMSP",
    title: `OMSP — ${SITE_FULL_NAME}`,
    description: SITE_DESCRIPTION,
  },

  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${jetbrains.variable}`}
    >
      <body className="bg-ocean-950 text-white font-body antialiased">
        <ToastProvider>
          <Suspense fallback={null}>
            <PublicActivityTracker />
          </Suspense>

          {children}
        </ToastProvider>
      </body>
    </html>
  );
}