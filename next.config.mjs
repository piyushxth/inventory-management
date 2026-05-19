/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.unsplash.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "scontent.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
      },
    ],
  },

  webpack(config) {
    // 🔥 Find existing asset rule handling images
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg"),
    );

    // ❌ Exclude svg from default loader
    if (fileLoaderRule) {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    // ✅ Add SVGR + fallback file loader
    config.module.rules.push({
      test: /\.svg$/i,
      oneOf: [
        {
          issuer: /\.[jt]sx?$/,
          use: ["@svgr/webpack"], // React component
        },
        {
          type: "asset/resource", // fallback (for url usage)
        },
      ],
    });

    return config;
  },
};

export default nextConfig;
