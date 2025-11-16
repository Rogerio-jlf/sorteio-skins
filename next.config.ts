/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.cloudflare.steamstatic.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "steamcdn-a.akamaihd.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "community.cloudflare.steamstatic.com",
        pathname: "/**",
      },
      // Adicione outros domínios conforme necessário
    ],
  },
};

export default nextConfig;
