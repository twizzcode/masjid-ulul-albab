import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/keuangan", destination: "/", permanent: false }]
  },
  experimental: {
    agentUpgrade: "security",
  },
}

export default nextConfig
