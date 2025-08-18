"use client";

import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { BadgeCheck } from "lucide-react";
import Image from "next/image";
import achievementImage from "@/public/digital-nomad.svg";
import {
	IconBadges,
	IconCertificate,
	IconLaurelWreath,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useOCAuth } from "@opencampus/ocid-connect-js";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import OC from "@/public/oc.svg";
import { Skeleton } from "@/components/ui/skeleton";
import IssueBadge from "@/components/ui/IssueBadge";
import { isUnlockable, summarizePerformance } from "@/helpers";

export type AchievementCondition =
	| { type: "course_completed"; count: number; score: number; amount: number }
	| { type: "quiz_score"; count: number; score: number; amount: number }
	| { type: "investment"; count: number; score: number; amount: number };

export type performanceSummaryTpe =
	| {
			completedCourses: number;
			quizScores: {
				courseId: any;
				score: any;
			}[];
			highestScore: number;
			totalStakedEdu: number;
	  }
	| undefined;

export type Achievement = {
	id: string; // uuid
	name: string;
	description: string;
	credential_type?: string | null;
	yuzu_allocation: number;
	criteria?: string | null;
	badge_image: string;
	validity_period?: string | null; // interval returned as string in Supabase client
	created_at?: string | null; // ISO date string
	updated_at?: string | null; // ISO date string
	status: "claimable" | "claimed" | "coming-soon" | "locked" | string;
	condition: AchievementCondition;
};

const Achievements = () => {
	const { isInitialized, ocAuth, OCId } = useOCAuth();
	const { data: session } = useSession();

	const { data: performance } = useQuery({
		queryKey: ["performance", session?.user.id],
		enabled: !!session?.user.id,
		queryFn: async () => {
			const { data, error } = await supabase
				.from("performance")
				.select("*")
				.eq("user_id", session?.user.id);

			if (error) {
				throw new Error(error.message);
			}
			return data;
		},
	});

	const {
		data: badges,
		error,
		isPending,
	} = useQuery({
		queryKey: ["badges"],
		enabled: !!session?.user.id,
		queryFn: async () => {
			const { data, error } = await supabase
				.from("achievements")
				.select("*")
				.eq("credential_type", "badge");
			if (error) {
				console.log(error);
				throw new Error(error.message);
			}
			return data;
		},
	});

	const {
		data: user_achievements,
		error: user_achievements_error,
		isPending: user_achievements_pending,
	} = useQuery({
		enabled: !!session?.user.id,
		queryKey: ["user_achievements", session?.user.id],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("user_achievements")
				.select("achievement_id")
				.eq("user_id", session?.user.id);
			if (error) {
				console.log(error);
				throw new Error(error.message);
			}
			return data;
		},
	});

	const {
		data: certifications,
		error: certifications_error,
		isPending: certifications_pending,
	} = useQuery({
		queryKey: ["certifications"],
		enabled: !!session?.user.id,
		queryFn: async () => {
			const { data, error } = await supabase
				.from("achievements")
				.select("*")
				.eq("credential_type", "certification");
			if (error) {
				console.log(error);
				throw new Error(error.message);
			}
			return data;
		},
	});

	const {
		data: achievements,
		error: achievements_error,
		isPending: achievements_pending,
	} = useQuery({
		queryKey: ["achievements-data"],
		enabled: !!session?.user.id,
		queryFn: async () => {
			const { data, error } = await supabase
				.from("achievements")
				.select("*")
				.eq("credential_type", "achievement");
			if (error) {
				console.log(error);
				throw new Error(error.message);
			}
			return data;
		},
	});

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

	const skeletonArray = Array(5).fill(null);

	return (
		<div>
			<div className="flex border-b p-5 md:p-0 flex-col md:flex-row max-w-4xl mx-auto justify-center items-center gap-4 ">
				<div className="flex-[1.5] w-full space-y-3">
					<h1 className="text-xl md:text-3xl lg:text-4xl mb-2 font-bold">
						Achievements, Badges & Certifications
					</h1>
					<p className="text-muted-foreground text-[14px]">
						Track your progress, unlock badges, and view your certificates.
					</p>
				</div>
				<div className="flex-1 hidden md:flex w-full">
					<Image
						alt="achievement"
						className="h-auto w-full invert-0 dark:invert"
						src={achievementImage}
					/>
				</div>
			</div>

			<main className="container mx-auto px-6 py-8 space-y-10">
				<section>
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-semibold flex items-center gap-2">
							<IconBadges className="size-5 text-primary" /> Badges
						</h2>
					</div>

					{/* Loading */}
					{isPending && user_achievements_pending && (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
							{skeletonArray.map((_, i) => (
								<Card key={i} className="p-4">
									<Skeleton className="aspect-square rounded-lg" />
									<div className="mt-3 space-y-2">
										<Skeleton className="h-4 w-3/4" />
										<Skeleton className="h-4 w-1/2" />
										<Skeleton className="h-3 w-full" />
									</div>
									<div className="mt-2">
										<Skeleton className="h-8 w-20" />
									</div>
								</Card>
							))}
						</div>
					)}

					{/* Error */}
					{!isPending && error && user_achievements_error && (
						<div className="text-center text-red-500 p-6">
							<p>Failed to load achievements.</p>
							<Button
								variant="outline"
								onClick={() => location.reload()}
								className="mt-2"
							>
								Retry
							</Button>
						</div>
					)}

					{/* Empty */}
					{!isPending && !error && badges && badges.length === 0 && (
						<div className="text-center p-6 text-muted-foreground">
							<IconLaurelWreath className="mx-auto size-8 text-primary mb-2" />
							<p>No Badges yet!</p>
						</div>
					)}

					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
						{badges?.map((badge: Achievement, i) => {
							const performanceSummary: performanceSummaryTpe =
								performance &&
								summarizePerformance(performance as Performance[]);
							const claimed = user_achievements?.some(
								(ua) => ua.achievement_id === badge.id
							);
							const canUnlock = isUnlockable(badge, performanceSummary);
							const isClaimable = !claimed && canUnlock;
							const isComing = badge.status === "coming-soon";

							return (
								<Card
									key={i}
									className={`p-4 ${claimed || isClaimable ? "ring-1 ring-primary/30 border-primary/50" : ""} ${isComing || !canUnlock ? "opacity-70" : ""}`}
								>
									<div className="aspect-square rounded-lg bg-accent/10 flex items-center justify-center">
										{/* <Medal className="w-10 h-10 text-primary" /> */}
										<Image
											width={138}
											height={138}
											src={badge.badge_image}
											alt={badge.name}
											className={cn({
												"grayscale-100": isComing || !claimed,
											})}
										/>
									</div>
									<div className="mt-3">
										<CardTitle className="text-base">
											{badge.name}
											{canUnlock ? " true" : " false"}{" "}
										</CardTitle>
										<span className="text-lime-500 font-semibold">
											{badge.yuzu_allocation.toLocaleString()} YUZU
										</span>
										<CardDescription>{badge.criteria}</CardDescription>
									</div>
									<div className="mt-2 flex items-center gap-2">
										{claimed && (
											<Button disabled size="sm">
												Claimed
											</Button>
										)}

										{isClaimable && isInitialized && OCId && (
											<IssueBadge OCId={OCId} badge={badge} />
										)}

										{isClaimable && (!isInitialized || !OCId) && (
											<Button
												onClick={handleLogin}
												className="w-full"
												size="sm"
											>
												<Image src={OC} alt="open campus" /> Connect OCID
											</Button>
										)}

										{isComing && canUnlock && (
											<Badge variant="outline">Coming Soon</Badge>
										)}

										{!canUnlock && !claimed && (
											<Button disabled size="sm">
												Locked
											</Button>
										)}
									</div>
								</Card>
							);
						})}
					</div>
				</section>
				{/* achievements */}
				<section>
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-semibold flex items-center gap-2">
							<IconLaurelWreath className="size-5 text-primary" />
							Achievements
						</h2>
					</div>
					{achievements_pending && (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
							{skeletonArray.map((_, i) => (
								<Card key={i} className="p-4">
									<Skeleton className="aspect-square rounded-lg" />
									<div className="mt-3 space-y-2">
										<Skeleton className="h-4 w-3/4" />
										<Skeleton className="h-4 w-1/2" />
										<Skeleton className="h-3 w-full" />
									</div>
									<div className="mt-2">
										<Skeleton className="h-8 w-20" />
									</div>
								</Card>
							))}
						</div>
					)}
					{!achievements_pending && achievements_error && (
						<div className="text-center text-red-500 p-6">
							<p>Failed to load achievements.</p>
							<Button
								variant="outline"
								onClick={() => location.reload()}
								className="mt-2"
							>
								Retry
							</Button>
						</div>
					)}
					<div className="grid gap-4 sm:grid-cols-2">
						{achievements?.map((c, i) => (
							<Card key={i}>
								<CardHeader>
									<div className="flex items-center gap-3">
										<BadgeCheck className="w-5 h-5 text-primary" />

										<CardTitle className="text-base">{c.name}</CardTitle>
									</div>
									<CardDescription>Status: {c.status}</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex gap-2">
										<Button size="sm" variant="outline">
											View
										</Button>
										<Button size="sm" disabled={c.status !== "Issued"}>
											Download
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
					{!achievements_pending &&
						!achievements_error &&
						achievements &&
						achievements.length === 0 && (
							<div className="text-center p-6 text-muted-foreground">
								<IconLaurelWreath className="mx-auto size-8 text-primary mb-2" />
								<p>No achievements yet!</p>
							</div>
						)}
				</section>
				{/* certifications */}
				<section>
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-semibold flex items-center gap-2">
							<IconCertificate className="size-5 text-primary" />
							Certifications
						</h2>
					</div>
					{certifications_pending && (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
							{skeletonArray.map((_, i) => (
								<Card key={i} className="p-4">
									<Skeleton className="aspect-square rounded-lg" />
									<div className="mt-3 space-y-2">
										<Skeleton className="h-4 w-3/4" />
										<Skeleton className="h-4 w-1/2" />
										<Skeleton className="h-3 w-full" />
									</div>
									<div className="mt-2">
										<Skeleton className="h-8 w-20" />
									</div>
								</Card>
							))}
						</div>
					)}
					{!certifications_pending && certifications_error && (
						<div className="text-center text-red-500 p-6">
							<p>Failed to load certifications.</p>
							<Button
								variant="outline"
								onClick={() => location.reload()}
								className="mt-2"
							>
								Retry
							</Button>
						</div>
					)}
					<div className="grid gap-4 sm:grid-cols-2">
						{certifications?.map((c, i) => (
							<Card key={i}>
								<CardHeader>
									<div className="flex items-center gap-3">
										<BadgeCheck className="w-5 h-5 text-primary" />

										<CardTitle className="text-base">{c.name}</CardTitle>
									</div>
									<CardDescription>Status: {c.status}</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex gap-2">
										<Button size="sm" variant="outline">
											View
										</Button>
										<Button size="sm" disabled={c.status !== "Issued"}>
											Download
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
					{!certifications_pending &&
						!certifications_error &&
						certifications &&
						certifications.length === 0 && (
							<div className="text-center p-6 text-muted-foreground">
								<IconCertificate className="mx-auto size-8 text-primary mb-2" />
								<p>No certifications yet!</p>
							</div>
						)}
				</section>
			</main>
		</div>
	);
};

export default Achievements;
