import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "YieldEdu",
		short_name: "YieldEdu",
		description:
			"A Web3 protocol that lets you earn guaranteed yields on your EDU tokens while learning about Web3.",
		start_url: "/",
		display: "standalone",
		background_color: "#f0f4f8",
		theme_color: "#84cc16",
		scope: "/",
		screenshots: [
			{
				src: "/yieldedu-screenshot1.png",
				type: "image/png",
				sizes: "1896x812",
				form_factor: "wide",
			},
			{
				src: "/yieldedu-screenshot2.png",
				sizes: "1900x821",
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
	};
}
