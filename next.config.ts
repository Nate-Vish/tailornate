import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove X-Powered-By: Next.js header — no reason to advertise the stack
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Control referrer leakage
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Restrict browser feature access
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // CSP: frame-ancestors + object-src + base-uri are safe to lock down fully.
          // script-src requires nonce implementation for Next.js hydration scripts —
          // that's a separate task. This gives meaningful protection today.
          {
            key: "Content-Security-Policy",
            value: [
              "frame-ancestors 'none'",
              "object-src 'none'",
              "base-uri 'self'",
            ].join("; "),
          },
        ],
      },
      {
        source: "/api/chat",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://tailornate.com" },
          { key: "Access-Control-Allow-Methods", value: "POST" },
        ],
      },
    ]
  },
};

export default nextConfig;
