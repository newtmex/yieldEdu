import { MetadataRoute } from "next";

const NEXT_PUBLIC_WEBSITE_URL =
	process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			disallow: "/private/",
		},
		sitemap: `${NEXT_PUBLIC_WEBSITE_URL}/sitemap.xml`,
	};
}
