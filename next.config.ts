import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,
    eslint: {
        // Linting runs separately; builds should not fail on style-level warnings.
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
