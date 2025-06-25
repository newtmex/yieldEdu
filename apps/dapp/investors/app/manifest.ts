import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "YieldEdu",
		short_name: "YieldEdu",
		description:
			"The future of on-chain education. YieldEdu lets you invest in learning, earn from participation, and power a smarter, decentralized world—whether you're an investor or a learner.",
		start_url: "/",
		display: "standalone",
		display_override: ["window-controls-overlay", "standalone"],
		background_color: "#f0f4f8",
		theme_color: "#84cc16",
		scope: "/",
		categories: ["education", "productivity", "finance"],
		screenshots: [
			{
				src: "/yieldedu-screenshot-1.png",
				type: "image/png",
				sizes: "1216x832",
				form_factor: "wide",
			},
			{
				src: "/yieldedu-screenshot-2.png",
				sizes: "540x720",
				type: "image/png",
				form_factor: "narrow",
			},
		],
		icons: [
			{
				src: "/icon2.png",
				sizes: "200x200",
				type: "image/png",
			},
		],
		protocol_handlers: [
			{
				protocol: "web+yieldedu",
				url: "/handle-protocol?url=%s",
			},
		],
	};
}
