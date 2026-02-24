import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.paintx.art",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
