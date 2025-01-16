import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    env: {
        BACKEND_URL: "api.kts.testcode.tools"
    },
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'image.tmdb.org',
            pathname: '/t/p/**',
          },
        ],
      },
};

export default nextConfig;