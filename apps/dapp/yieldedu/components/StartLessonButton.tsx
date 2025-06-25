"use client";
import React from "react";
import { Button } from "./ui/button";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";

const NEXT_PUBLIC_WEBSITE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL;

if (!NEXT_PUBLIC_WEBSITE_URL) {
	throw new Error("NEXT_PUBLIC_WEBSITE_URL is missing from the env.");
}

const StartLessonButton = ({
	lessonId,
	title,
}: {
	lessonId: string;
	title?: string;
}) => {
	const { isConnected, address } = useAppKitAccount();
	const { open } = useAppKit();

	const router = useRouter();

	const { mutate, isPending, isSuccess } = useMutation({
		mutationKey: ["generate-lesson"],
		mutationFn: (mutationAddress: string) => {
			const response = axios.post(
				`${NEXT_PUBLIC_WEBSITE_URL}/api/gemini/generate`,
				{
					lessonCount: "5",
					topic: title,
					lessonId,
					address: mutationAddress,
				}
			);
			return response;
		},
	});

	const handleLessonStart = async () => {
		if (!isConnected) open({ view: "Connect" });
		if (isConnected) {
			mutate(address!);
		}
	};

	React.useEffect(() => {
		if (isSuccess) {
			router.push("/dashboard/learn/start-lesson/" + lessonId + "/room");
		}
	}, [isSuccess, router, lessonId]);

	return (
		<Button
			disabled={isPending || isSuccess}
			onClick={handleLessonStart}
			className="w-full text-white bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-background font-medium py-6 text-lg"
		>
			{isPending ? (
				<>
					<div className="size-6 rounded-full animate-[spin_0.6s_linear_infinite;] border-b-transparent border-[3px] border-black"></div>
					Preparing your lesson...
				</>
			) : !isConnected ? (
				"Connect your wallet to start the lesson"
			) : isSuccess ? (
				<>
					<div className="size-6 rounded-full animate-[spin_0.6s_linear_infinite;] border-b-transparent border-[3px] border-black"></div>
					Preparing room...
				</>
			) : (
				"Start the Session"
			)}
		</Button>
	);
};

export default StartLessonButton;
