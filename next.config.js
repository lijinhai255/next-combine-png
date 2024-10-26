/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // 改为静态导出
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
