"use client";

import { OCConnect } from "@opencampus/ocid-connect-js";

export default function OCConnectWrapper({
	children,
}: {
	children: React.ReactNode;
}) {
	const opts = {
		redirectUri: "http://localhost:3000/redirect",
		referralCode: "PARTNER6", // Your partner code
	};
	return (
		<OCConnect opts={opts} sandboxMode={true}>
			{children}
		</OCConnect>
	);
}
