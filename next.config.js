/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",  // required for Docker multi-stage build

  async rewrites() {
    // In Docker, frontend talks to backend via service name.
    // Locally, it talks to localhost:8000.
    const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    return [
      {
        source:      "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;