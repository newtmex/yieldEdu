"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

const page = () => {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
			<div className="flex flex-col items-center space-y-4">
				<div className="rounded-full bg-yellow-100 p-4 dark:bg-yellow-900/20">
					<AlertTriangle className="h-10 w-10 text-yellow-500 dark:text-yellow-400" />
				</div>
				<h1 className="text-3xl font-bold text-foreground sm:text-4xl">
					Unauthorized
				</h1>
				<p className="max-w-md text-muted-foreground">
					You don’t have permission to access this page. If you think this is a
					mistake, contact support or try again later.
				</p>

				<Link href="/">
					<Button className="mt-4">Go Back Home</Button>
				</Link>
			</div>
		</div>
	);
};

export default page;
