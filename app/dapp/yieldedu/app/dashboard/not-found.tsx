import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookX } from "lucide-react";

const Page = () => {
	return (
		<div className="container flex flex-col items-center justify-center min-h-[70vh] text-center">
			<div className="flex flex-col items-center space-y-6 text-center">
				<div className="rounded-full bg-red-800 p-6">
					<BookX className="h-12 w-12 text-red-400" />
				</div>
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
						Page Not Found
					</h1>
					<p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
						Oops! The page you&apos;re looking for doesn&apos;t exist or has
						been moved.
					</p>
				</div>
				<div className="flex flex-col gap-2 min-[400px]:flex-row">
					<Button asChild>
						<Link href="/dashboard">Go to Dashboard</Link>
					</Button>
				</div>
			</div>
		</div>
	);
};

export default Page;
