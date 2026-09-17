const nextConfig = {
  distDir: process.env.HERO_REBUILD === "1" ? ".next-hero-rebuild" : ".next",
  poweredByHeader: false,
  devIndicators: false,
  images: { formats: ["image/webp"], qualities: [75, 90] },
};
export default nextConfig;
