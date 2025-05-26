"use client";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

import { useOCAuth } from "@opencampus/ocid-connect-js";
import Link from "next/link";
import { ClassValue } from "clsx";

export default function LoginButton({
	userType,
	className,
}: {
	userType: "student";
	className?: ClassValue;
}) {
	const { ocAuth, authState } = useOCAuth();

	const handleLogin = async () => {
		try {
			await ocAuth?.signInWithRedirect({ state: "opencampus" });
		} catch (error) {
			console.error("Login error:", error);
		}
	};

	return !authState?.isAuthenticated ? (
		<Button
			onClick={handleLogin}
			size="lg"
			className={cn(
				"text-white dark:text-slate-900 font-semibold hover:opacity-90 px-8",
				{
					"bg-gradient-to-r from-lime-500 to-lime-600": userType === "student",
				},
				className
			)}
		>
			Connect with OCID
			<ArrowRight className="ml-2 h-5 w-5" />
		</Button>
	) : (
		<Link href={"/dashboard"} target="_blank">
			<Button
				onClick={handleLogin}
				size="lg"
				className={cn(
					"text-white dark:text-slate-900 font-semibold hover:opacity-90 px-8",
					className
				)}
			>
				Launch App
				<ArrowRight className="ml-2 h-5 w-5" />
			</Button>
		</Link>
	);
}
