import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  // Proxy /backend/* to the FastAPI server so the browser only ever talks to
  // the Next.js origin (needed in the v0 preview, which exposes one port; also
  // works locally). Override with BACKEND_ORIGIN when the backend is deployed
  // elsewhere (e.g. Render).
  async rewrites() {
    const backendOrigin = process.env.BACKEND_ORIGIN || "http://127.0.0.1:8000";
    return [
      {
        source: "/backend/:path*",
        destination: `${backendOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
