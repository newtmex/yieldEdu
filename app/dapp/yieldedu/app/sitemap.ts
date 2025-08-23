import { MetadataRoute } from "next";
const NEXT_PUBLIC_WEBSITE_URL =
	process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";

type changeFrequency =
	| "always"
	| "hourly"
	| "daily"
	| "weekly"
	| "monthly"
	| "yearly"
	| "never";

export default function sitemap(): MetadataRoute.Sitemap {
	const changeFrequency = "monthly" as changeFrequency;
	const routes = [
		"",
		"/about-us",
		"/features",
		"/blogs",
		"/community",
		"/careers",
		"/contact-support",
		"/dashboard",
		"/dashboard/stake",
		"/dashboard/rewards",
		"/dashboard/protocol-stats",
		"/dashboard/community",
		"/dashboard/portfolio",
		"/dashboard/transactions",
	].map((route) => ({
		url: `${NEXT_PUBLIC_WEBSITE_URL}${route}`,
		lastModified: new Date(),
		changeFrequency,
		priority: 1,
	}));
	return [...routes];
}
