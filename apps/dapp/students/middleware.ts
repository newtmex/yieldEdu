import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request);

	// Set x-real-ip header for local development if not present
	if (
		process.env.NODE_ENV === "development" &&
		!request.headers.has("x-real-ip")
	) {
		request.headers.set("x-real-ip", "127.0.0.1");
	}

	if (!sessionCookie) {
		// return NextResponse.redirect(new URL("/signin", request.url));
	}

	return NextResponse.next();
}

export const config = {
	// matcher: [
	// 	"/",
	// 	"/courses/:path*",
	// 	"/leaderboard",
	// 	"/achievements/:path*",
	// 	"/settings",
	// ],
};
