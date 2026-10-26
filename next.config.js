// Files the certificate PDF reads from /public at runtime (fonts + logo). Vercel
// only bundles what it can trace from imports, so list them for the PDF routes.
const pdfPublicFiles = [
  "./public/fonts/**/*",
  "./public/images/**/*",
  "./public/*.png",
  "./public/*.jpg",
  "./public/*.svg",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
    outputFileTracingIncludes: {
      "/api/certificates/[id]/pdf": pdfPublicFiles,
      "/api/certificates": pdfPublicFiles,
    },
  },
};

module.exports = nextConfig;