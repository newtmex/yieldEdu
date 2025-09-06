"use client";

import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import AudioVisualizer from "./AudioVisualizer";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";

const AIVideo = ({
	// type,
	// userId,
	// username,

	className,
	isSpeaking,
}: {
	type?: string;
	username?: string;
	className?: ClassValue;
	isSpeaking: boolean;
}) => {
	return (
		<div
			className={cn(
				"relative grid place-content-center w-full h-full transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800",
				className,
				{
					"border-blue-400/50 shadow-[0_0_15px_-3px_rgba(96,165,250,0.4)]":
						isSpeaking,
				}
			)}
		>
			<div className="aspect-video w-full flex items-center justify-center">
				<div className="text-center">
					<div className="relative">
						{isSpeaking && (
							<>
								<div className="absolute inset-0 rounded-full animate-ping-slow opacity-20 bg-blue-400 dark:bg-blue-500 scale-150" />
								<div className="absolute inset-0 rounded-full animate-ping-slower opacity-10 bg-blue-400 dark:bg-blue-500 scale-200" />
								<div className="absolute inset-0 rounded-full bg-blue-400/10 dark:bg-blue-500/10 scale-125" />
							</>
						)}
						<Avatar
							className={cn(
								"w-24 h-24 mx-auto mb-4 border-2 transition-all duration-300",
								isSpeaking
									? "border-blue-400/50 dark:border-blue-500/50 shadow-[0_0_15px_-3px_rgba(96,165,250,0.4)]"
									: "border-white/50 dark:border-gray-800/50"
							)}
						>
							<AvatarImage
								src="https://api.dicebear.com/7.x/adventurer/svg?seed=harry-potter&gender=male&backgroundColor=b6e3f4,c0aede,d1d4f9&radius=50"
								alt="Male Teacher"
								className="bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-800 dark:to-indigo-900"
							/>
							<AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-800 dark:to-indigo-900">
								AI
							</AvatarFallback>
						</Avatar>
						<div className="absolute bottom-4 left-0 right-0 flex justify-center">
							<AudioVisualizer isActive={isSpeaking} barCount={5} />
						</div>
					</div>
					<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
						Harry
					</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400">Educator</p>
				</div>
			</div>

			<div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
				<span
					className={cn("h-2 w-2 rounded-full transition-colors", {
						"bg-blue-500 animate-pulse-soft shadow-[0_0_5px_2px_rgba(96,165,250,0.3)]":
							isSpeaking,
						"bg-gray-300 dark:bg-gray-600": !isSpeaking,
					})}
				></span>
				<span className="text-sm text-gray-700 dark:text-gray-300">
					AI Assistant
				</span>
			</div>
		</div>
	);
};

export default AIVideo;
