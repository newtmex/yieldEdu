"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getAllLessons, lessonsInterface } from "@/data/lessons";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/utils/supabase/server";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import {
	Check,
	Clock,
	// GraduationCap,
	Lock,
	// Lock,
	// Sparkles,
	// Trophy,
} from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const LearnClientPage = () => {
	const [lessons, setLessons] = useState<lessonsInterface[]>([]);
	const { isConnected, address } = useAppKitAccount();
	const { open } = useAppKit();

	const router = useRouter();

	useEffect(() => {
		const fetchLessons = async () => {
			const lessons = await getAllLessons();

			const { data: user_completed_lessons } = await supabase
				.from("user_completed_lessons")
				.select("*")
				.eq("user_wallet", address);

			console.log(user_completed_lessons);

			if (!lessons?.success) {
				toast({
					title: "Error",
					description: lessons.error,
					variant: "destructive",
					duration: 5000,
				});
			}

			const completedSet = new Set(
				user_completed_lessons?.map((l) => l.lesson_id)
			);
			let previousCompleted = true;

			const updatedLessons = lessons.data?.map((lesson) => {
				const isCompleted = completedSet.has(lesson.id);
				const isLocked = !previousCompleted;

				// allow next lesson to unlock if the previous one is completed
				previousCompleted = previousCompleted && isCompleted;

				return { ...lesson, completed: isCompleted, isLocked };
			});

			setLessons(updatedLessons || []);
		};

		if (address) {
			fetchLessons();
		}
	}, [address]);

	const handleLessonButton = (lesson: lessonsInterface) => {
		if (!isConnected) open({ view: "Connect" });

		if (isConnected && lesson.completed)
			router.push(`/dashboard/learn/review-lesson/${lesson.id}`);

		if (isConnected && !lesson.completed) {
			router.push(`/dashboard/learn/${lesson.id}`);
		}
	};

	return (
		<CardContent>
			{isConnected ? (
				<div className="relative">
					{/* <div className="absolute left-3 h-full w-0.5 bg-slate-200 dark:bg-slate-700/50"></div> */}
					<div className="space-y-8 relative">
						{lessons?.map((lesson, index) => {
							return (
								<div key={index} className="ml-9 relative">
									<div
										className={`absolute -left-9 top-0 flex items-center justify-center w-6 h-6 rounded-full border-2 ${
											lesson.completed
												? "bg-lime-500 border-lime-500"
												: "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
										}`}
									>
										{lesson.completed && (
											<Check className="w-3 h-3 text-white" />
										)}
									</div>
									<div
										className={cn(
											"absolute -left-6 top-6 min-h-full h-48 md:h-36 w-0.5 bg-slate-200 dark:bg-slate-700/50",
											{
												"bg-lime-500 dark:bg-lime-500": lesson.completed,
											}
										)}
									></div>
									<div
										className={`p-4 rounded-xl border ${
											lesson.completed
												? "bg-lime-50 dark:bg-lime-500/10 border-lime-200 dark:border-lime-500/30"
												: "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50"
										}`}
									>
										<div className="flex justify-between gap-2 md:flex-nowrap flex-wrap-reverse items-start mb-2">
											<h3
												className={`font-medium ${
													lesson.completed
														? "text-lime-700 dark:text-lime-400"
														: "text-slate-900 dark:text-white"
												}`}
											>
												{lesson.title}
											</h3>
											<Badge
												className={
													lesson.completed
														? "bg-lime-100 dark:bg-lime-400/20 text-lime-600 dark:text-lime-400 border-lime-200 dark:border-lime-400/30"
														: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600"
												}
											>
												{lesson.completed ? "Completed" : "Incomplete"}
											</Badge>
										</div>
										<p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
											{lesson.description}
										</p>
										<div className="flex md:flex-nowrap flex-wrap gap-2 justify-between items-center">
											<div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
												<Clock className="w-4 h-4" />
												<span>{lesson.duration}</span>
											</div>

											{lesson.completed ? (
												<Button
													onClick={() => handleLessonButton(lesson)}
													variant={"outline"}
													className={cn(
														"transition-all  ease-linear duration-75",
														{
															"border-lime-200 dark:border-lime-500/30 hover:border-slate-900 text-lime-600 dark:text-lime-400 hover:bg-lime-50 dark:hover:bg-lime-500/10":
																lesson.completed,
														}
													)}
												>
													Review Lesson
												</Button>
											) : (
												<Button
													disabled={lesson.isLocked}
													onClick={() => handleLessonButton(lesson)}
													variant={"default"}
													className={cn(
														"transition-all  ease-linear duration-75",
														{
															"bg-gradient-to-r from-lime-500 to-yellow-500 hover:to-yellow-500/60 text-white dark:text-slate-900":
																!lesson.completed,
														}
													)}
												>
													Start Lesson
													{lesson.isLocked && <Lock className="mr-2" />}
												</Button>
											)}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			) : (
				<div className="text-center py-10">
					<p className="text-slate-500 dark:text-slate-400 text-lg mb-4">
						Please connect your wallet to view your learning journey.
					</p>
					<Button
						onClick={() => open({ view: "Connect" })}
						className="bg-gradient-to-r from-lime-500 to-yellow-500 hover:to-yellow-500/60 text-white dark:text-slate-900"
					>
						Connect Wallet
					</Button>
				</div>
			)}
		</CardContent>
	);
};

export default LearnClientPage;
