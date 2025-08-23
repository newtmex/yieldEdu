"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html>
			<body>
				<div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
					<div className="flex flex-col items-center space-y-6 text-center">
						<div className="rounded-full bg-red-100 dark:bg-red-900/20 p-6">
							<AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
						</div>
						<div className="space-y-2">
							<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
								Critical Error
							</h1>
							<p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
								A critical error has occurred. We apologize for the
								inconvenience.
							</p>
							{error && error.digest ? (
								<p className="text-sm text-muted-foreground">
									Error ID: {error.digest}
								</p>
							) : null}
						</div>
						<Button onClick={reset}>Try Again</Button>
					</div>
				</div>
			</body>
		</html>
	);
}
