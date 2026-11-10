import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

// Clickjacking protection. Set FRAME_ANCESTORS="'self'" in production.
// It is left unset by default so hosted previews that embed the site in an iframe keep working.
if (process.env.FRAME_ANCESTORS) {
  securityHeaders.push({
    key: "Content-Security-Policy",
    value: `frame-ancestors ${process.env.FRAME_ANCESTORS}`,
  });
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["nodemailer", "pdf-lib"],
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Brand assets and the app icon never change without a code deploy — cache them aggressively.
      {
        source: "/brand/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      { source: "/api/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
