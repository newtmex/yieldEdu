import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);

	if (!sessionCookie) {
		return NextResponse.redirect(new URL("/signin", request.url));
	}

	const lockedRoutes = ["/performance", "/leaderboards", "/campaigns"];

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
