import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
	// const session = await auth.api.getSession({
	// 	query: {
	// 		disableCookieCache: true,
	// 	},
	// 	headers: request.headers,
	// });

	// if (!session) {
	// 	return NextResponse.redirect(new URL("/signin", request.url));
	// }

	const lockedRoutes = [
		"/performance",
		"/leaderboards",
		"/campaigns",
		"/achievements",
	];
	if (
		lockedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
	) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/",
		"/courses/:path*",
		"/leaderboard",
		"/achievements/:path*",
		"/settings",
		"/performance",
		"/leaderboards",
		"/campaigns",
		"/achievements",
	],
};
