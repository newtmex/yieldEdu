"use client";

import { toast } from "sonner";
import { Button } from "./ui/button"; // Assuming you have a Button component
import { useOCAuth } from "@opencampus/ocid-connect-js";

export default function LoginButton() {
	const { ocAuth } = useOCAuth();

	const handleLogin = async () => {
		try {
			await ocAuth.signInWithRedirect({ state: "opencampus" });
		} catch (error) {
			console.error("Login error:", error);
			toast.error("Login failed", {
				description: error instanceof Error ? error.message : String(error),
			});
		}
	};
	return <Button onClick={handleLogin}>Connect with OCID</Button>;
}
