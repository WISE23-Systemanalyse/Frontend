import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    env: {
        BACKEND_URL: "http://localhost:8000"
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