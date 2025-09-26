'use strict';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Avoid any backend calls during install/build by using runtime env at runtime only
  // No rewrites/proxy set here; frontend fetch code should read NEXT_PUBLIC_API_URL at runtime.
  // Default expected backend port is 3002. Configure via NEXT_PUBLIC_API_URL in .env.local as needed.
};

module.exports = nextConfig;
