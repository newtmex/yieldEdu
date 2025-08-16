"use client";

import { LoginCallBack, useOCAuth } from "@opencampus/ocid-connect-js";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
	const router = useRouter();
	const [timeoutReached, setTimeoutReached] = useState(false);
	const { authState } = useOCAuth();

	// useEffect(() => {
	// 	const timer = setTimeout(() => {
	// 		setTimeoutReached(true);
	// 	}, 20000); // 10 seconds timeout

	// 	return () => clearTimeout(timer); // Cleanup on unmount
	// }, []);

	const onLoginSuccess = async () => {
		if (!timeoutReached) {
			router.push("/");
		}
	};

	const onLoginError = () => {
		console.log("Error during login callback", authState.error);
		return <div>Error Logging in: {authState.error}</div>;
	};

	if (timeoutReached) {
		return <TimeoutScreen />;
	}

	return (
		<LoginCallBack
			errorCallback={onLoginError}
			successCallback={onLoginSuccess}
			customErrorComponent={<ErrorScreen />}
			customLoadingComponent={<LoadingScreen />}
		/>
	);
}

function TimeoutScreen() {
	return (
		<div className="container flex flex-col items-center justify-center min-h-[70vh] py-12 text-center space-y-6">
			<AlertTriangle className="h-16 w-16 text-yellow-600 dark:text-yellow-400" />
			<h1 className="text-3xl font-bold">This is taking too long</h1>
			<p className="max-w-[600px] text-muted-foreground md:text-lg">
				The login process is taking longer than expected. Please refresh the
				page and try again.
			</p>
			<Button onClick={() => window.location.reload()}>Refresh Page</Button>
		</div>
	);
}

function ErrorScreen() {
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
						An error occurred during the login process. Please try again.
					</p>
				</div>
				<div className="flex flex-col gap-2 min-[400px]:flex-row">
					<Link href={"/signin"}>
						<Button>Try Again</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}

function LoadingScreen() {
	return (
		<div className="flex h-screen flex-col items-center justify-center">
			<svg
				width="48"
				height="48"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
				className="text-foreground"
			>
				<circle cx="4" cy="12" r="2" fill="currentColor">
					<animate
						id="spinner_qFRN"
						begin="0;spinner_OcgL.end+0.25s"
						attributeName="cy"
						calcMode="spline"
						dur="0.6s"
						values="12;6;12"
						keySplines=".33,.66,.66,1;.33,0,.66,.33"
					/>
				</circle>
				<circle cx="12" cy="12" r="2" fill="currentColor">
					<animate
						begin="spinner_qFRN.begin+0.1s"
						attributeName="cy"
						calcMode="spline"
						dur="0.6s"
						values="12;6;12"
						keySplines=".33,.66,.66,1;.33,0,.66,.33"
					/>
				</circle>
				<circle cx="20" cy="12" r="2" fill="currentColor">
					<animate
						id="spinner_OcgL"
						begin="spinner_qFRN.begin+0.2s"
						attributeName="cy"
						calcMode="spline"
						dur="0.6s"
						values="12;6;12"
						keySplines=".33,.66,.66,1;.33,0,.66,.33"
					/>
				</circle>
			</svg>
			<p className="mt-4 text-lg">Please wait, we are redirecting you...</p>
		</div>
	);
}
