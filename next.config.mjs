/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@novr/types"],
  experimental: {
    // Server actions carry base64 course thumbnails (resized client-side to
    // ≤640px JPEG); the default 1MB limit rejects larger ones silently.
    serverActions: { bodySizeLimit: "4mb" },
  },
  webpack: (config) => {
    // pdfjs-dist (via react-pdf) has an optional Node "canvas" require that
    // webpack tries to resolve even though we only render the PDF viewer
    // client-side. It isn't installed and isn't needed — alias it away.
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
