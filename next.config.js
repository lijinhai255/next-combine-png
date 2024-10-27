/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["imagedelivery.net"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://gif-converter.lijinhai255.workers.dev/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
