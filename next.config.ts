import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    /* config options here */
    basePath: "/readme_genius",
    output: 'export',
    trailingSlash: true,
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
