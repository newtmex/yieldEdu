"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error(error);
	}, [error]);

	return (
		<div className="container flex flex-col items-center justify-center min-h-[70vh] py-12 text-center">
			<div className="flex flex-col items-center space-y-6 text-center">
				<div className="rounded-full bg-red-100 dark:bg-red-900/20 p-6">
					<AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
				</div>
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
						Something went wrong
					</h1>
					<p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
						We apologize for the inconvenience. Please try again or contact
						support if the problem persists.
					</p>
					{error && error.digest ? (
						<p className="text-sm text-muted-foreground">
							Error ID: {error.digest}
						</p>
					) : null}
				</div>
				<div className="flex flex-col gap-2 min-[400px]:flex-row">
					<Button onClick={reset}>Try Again</Button>
				</div>
			</div>
		</div>
	);
}
