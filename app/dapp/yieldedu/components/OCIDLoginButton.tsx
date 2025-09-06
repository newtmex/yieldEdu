"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

export default function OCIDLoginButton() {
	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = async () => {
		setIsLoading(true);
	};
	// redirectUri: 'http://localhost:3000/redirect', // Adjust this URL
	// referralCode: 'PARTNER6', // Assign partner code

	return (
		<Button
			// disabled={isLoading}
			onClick={handleLogin}
			className="bg-gradient-to-r from-lime-500 to-yellow-500 text-slate-900 font-semibold hover:opacity-90"
			type="button"
		>
			{isLoading ? (
				<>
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					Connecting...
				</>
			) : (
				"Login"
			)}
		</Button>
	);
}
