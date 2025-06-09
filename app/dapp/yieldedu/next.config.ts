import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
	/* config options here */
	webpack: (config) => {
		config.externals.push("pino-pretty", "lokijs", "encoding");
		return config;
	},
};

export const pwaConfig = withPWA({
	disable: process.env.NODE_ENV === "development",
	dest: "public",
	register: true,
	skipWaiting: true,
});

export default nextConfig;
