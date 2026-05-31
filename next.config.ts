import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	allowedDevOrigins: ['*.ngrok-free.app', '*.ngrok.io', '*.ngrok.app'],
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
			},
		],
	},
};

export default nextConfig;
