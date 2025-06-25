"use client";

import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { MicOff } from "lucide-react";

const generateRandomAvatar = (seed: string): string => {
	const styles = ["personas", "micah", "adventurer", "avataaars"];
	const style = styles[Math.floor(Math.random() * styles.length)];
	return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=50`;
};
const UserVideo = ({
	className,
	isMuted,
}: {
	className?: ClassValue;
	isMuted: boolean;
}) => {
	const [userName] = useState("New User");
	const [userAvatar] = useState(generateRandomAvatar(userName));
	const [isSpeaking] = useState(false);

	return (
		<Card
			className={cn(
				className,
				"relative grid place-content-center w-full h-full dark:bg-slate-900/50 border-lime-400/30 overflow-hidden rounded-xl p-5 border shadow-sm",
				{
					"border-lime-400/50 shadow-[0_0_15px_-3px_rgb(163,230,53,0.4)]":
						isSpeaking,
				}
			)}
		>
			{isMuted && (
				<div className="absolute top-4 right-4 bg-red-500/80 p-2 rounded-full">
					<MicOff className="w-5 h-5 text-white" />
				</div>
			)}
			<div className="absolute inset-0 bg-gradient-to-r from-lime-400/5 to-yellow-400/5 dark:from-lime-400/5 dark:to-emerald-400/5"></div>

			<div className="aspect-video w-full flex items-center justify-center">
				<div className="text-center">
					<div className="relative">
						{isSpeaking && (
							<>
								<div className="absolute inset-0 rounded-full animate-ping-slow opacity-20 bg-lime-400 dark:bg-lime-500 scale-150" />
								<div className="absolute inset-0 rounded-full animate-ping-slower opacity-10 bg-lime-400 dark:bg-lime-500 scale-200" />
							</>
						)}
						<Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-black/10 dark:border-slate-400/20 shadow-lg">
							<AvatarImage
								src={userAvatar}
								alt={userName}
								className="bg-gradient-to-br from-slate-100 to-gray-200 dark:from-slate-700 dark:to-slate-800"
							/>
							<AvatarFallback className="bg-gradient-to-br from-slate-100 to-gray-200 dark:from-slate-700 dark:to-slate-800">
								{userName
									.split(" ")
									.map((name) => name[0])
									.join("")}
							</AvatarFallback>
						</Avatar>
					</div>
					<h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">
						{userName}
					</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400">Student</p>
				</div>
			</div>

			<div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime-400/20 border-lime-500/30 backdrop-blur-sm border">
				<span
					className={cn("h-2 w-2 rounded-full", {
						"bg-lime-500 animate-pulse-soft": isSpeaking,
						"bg-lime-500": !isSpeaking,
					})}
				></span>
				<span className="text-sm text-gray-700 dark:text-gray-300">
					{userName}
				</span>
			</div>
		</Card>
	);
};

export default UserVideo;
