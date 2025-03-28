/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    // 如果你的仓库不是部署在根目录，可能需要设置 basePath
    // basePath: '/你的仓库名',
    images: {
      unoptimized: true,
    },
    // 禁用 eslint 检查（如果构建时遇到 eslint 错误可以添加）
    // eslint: {
    //   ignoreDuringBuilds: true,
    // },
  }
  
  module.exports = nextConfig
  