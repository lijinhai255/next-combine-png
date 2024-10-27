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
        destination: "https://api.cloudflare.com/client/v4/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        // 匹配所有 API 路由
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,DELETE,OPTIONS",
          },
          { key: "Access-Control-Allow-Headers", value: "*" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
