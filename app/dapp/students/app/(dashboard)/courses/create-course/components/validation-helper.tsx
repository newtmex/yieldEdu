"use client";

import { useEffect } from "react";
import { FieldErrors } from "react-hook-form";
import { toast } from "sonner";

// Collect just messages, ignoring field paths
function extractErrorMessages(errors: FieldErrors): string[] {
	let messages: string[] = [];

	for (const value of Object.values(errors)) {
		if (value && typeof value === "object" && "message" in value) {
			messages.push((value as any).message);
		} else if (Array.isArray(value)) {
			value.forEach((item) => {
				if (item && typeof item === "object") {
					messages = [...messages, ...extractErrorMessages(item)];
				}
			});
		} else if (value && typeof value === "object") {
			messages = [...messages, ...extractErrorMessages(value as FieldErrors)];
		}
	}

	return messages;
}

export default function ValidationHelp({ errors }: { errors: FieldErrors }) {
	useEffect(() => {
		if (Object.keys(errors).length > 0) {
			const messages = extractErrorMessages(errors);

			toast.error("Form Errors", {
				description: (
					<ul className="list-disc list-inside space-y-1">
						{messages.map((msg, idx) => (
							<li key={idx}>{msg}</li>
						))}
					</ul>
				),
				duration: Infinity,
			});
		}
	}, [errors]);

	return null;
}
