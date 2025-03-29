/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    basePath: '/site_pure',
    images: {
      unoptimized: true,
    },
    // 禁用 eslint 检查（如果构建时遇到 eslint 错误可以添加）
    // eslint: {
    //   ignoreDuringBuilds: true,
    // },
  }
  
  module.exports = nextConfig
  