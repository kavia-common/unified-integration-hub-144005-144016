'use strict';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Avoid any backend calls during install/build by using runtime env at runtime only
  // No rewrites/proxy set here; frontend fetch code should read NEXT_PUBLIC_API_URL at runtime.
};

module.exports = nextConfig;
