/**
 * lib/certificates/pdf-assets.ts
 *
 * Server-only. Loads the fonts and logo used by the certificate PDF straight
 * from /public on disk and hands them to @react-pdf/renderer as base64 data
 * URIs, so rendering never depends on the app being able to fetch itself over
 * HTTP (which broke whenever the dev port differed from the hard-coded one).
 *
 * If a file cannot be read (e.g. /public is not bundled into the runtime), the
 * public URL is used as a fallback.
 */

import fs from "fs";
import path from "path";
import { Font } from "@react-pdf/renderer";
import { getSiteUrl } from "@/lib/site-url";

const MIME: Record<string, string> = {
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".woff": "font/woff",
  ".png": "image/png",
};

const cache = new Map<string, string>();

/** `publicPath` is relative to /public, e.g. "fonts/Signatie.otf". */
export function getPdfAssetSrc(publicPath: string): string {
  const cached = cache.get(publicPath);
  if (cached) return cached;

  let src: string;
  try {
    const file = path.join(process.cwd(), "public", publicPath);
    const mime = MIME[path.extname(publicPath).toLowerCase()] ?? "application/octet-stream";
    src = `data:${mime};base64,${fs.readFileSync(file).toString("base64")}`;
  } catch (err) {
    const url = `${getSiteUrl()}/${publicPath}`;
    console.error(
      `[certificate-pdf] Could not read "${publicPath}" from disk (cwd: ${process.cwd()}): ` +
        `${err instanceof Error ? err.message : err}. Falling back to ${url}`
    );
    return url;
  }

  cache.set(publicPath, src);
  return src;
}

export function getPdfLogoSrc() {
  return getPdfAssetSrc("images/omsp-mark.png");
}

let fontsRegistered = false;

export function registerPdfFonts() {
  if (fontsRegistered) return;
  fontsRegistered = true;

  // Signature fonts
  Font.register({ family: "Signatie", src: getPdfAssetSrc("fonts/Signatie.otf") });
  Font.register({
    family: "AmsterdamHandwriting",
    src: getPdfAssetSrc("fonts/AmsterdamHandwriting.ttf"),
  });
  Font.register({ family: "BastligaOne", src: getPdfAssetSrc("fonts/BastligaOne.ttf") });
  Font.register({ family: "Cintarini", src: getPdfAssetSrc("fonts/Cintarini.ttf") });
  Font.register({ family: "OceanTrace", src: getPdfAssetSrc("fonts/OceanTrace.ttf") });

  // Body font: the preview inherits DM Sans from the site layout.
  Font.register({
    family: "DMSans",
    fonts: [
      { src: getPdfAssetSrc("fonts/DMSans-400.woff"), fontWeight: 400 },
      { src: getPdfAssetSrc("fonts/DMSans-600.woff"), fontWeight: 600 },
      { src: getPdfAssetSrc("fonts/DMSans-700.woff"), fontWeight: 700 },
    ],
  });

  // The preview doesn't hyphenate; react-pdf would otherwise break long words.
  Font.registerHyphenationCallback((word) => [word]);
}
