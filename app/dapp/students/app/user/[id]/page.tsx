"use client";

import { TooltipInfo } from "@/components/tooltip-info";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import { supabase } from "@/lib/supabase";
import {
	IconBadges,
	IconCertificate,
	IconLaurelWreath,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, CalendarRange } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

const Page = () => {
	const { id } = useParams();
	const { data: session } = useSession();
	const {
		data: profileDetails,
		isPending: isProfileDetailsPending,
		isError: isProfileDetailsError,
	} = useQuery({
		queryKey: ["profile-details", id],
		queryFn: async () => {
			const response = await supabase
				.from("user")
				.select(
					`
                  id,
                  name,
                  createdAt,
                  image,
                  students ( username ),
                  user_achievements (
                    claimed_at,
                    nftCollection,
                    id,
                    achievements (
                      badge_image,
                      name,
                      description
                    )
                  )
                `
				)
				.eq("id", id)
				.single();

			if (response.error) {
				console.log(response.error);
				throw new Error(response.error.message);
			}
			return response.data;
		},
		enabled: !!id,
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

	const skeletonArray = Array(5).fill(null);

	return (
		<div className="min-h-screen bg-profile-dark">
			{/* Header */}
			<div className="bg-gradient-to-r from-profile-surface to-profile-surface-hover border-b border-profile-border">
				{!session?.user ? (
					<Button className="ml-auto block my-2 mr-2">Sign in</Button>
				) : (
					<Link href={"/"}>
						<Button className="ml-auto block my-2 mr-2">Back to Hub</Button>
					</Link>
				)}
				<div className="max-w-4xl mx-auto px-6 py-8">
					{isProfileDetailsPending ? (
						// 🔹 Entire loading block
						<div className="flex items-start gap-4">
							{/* Avatar skeleton */}
							<Skeleton className="size-16 md:size-24 rounded-full" />

							<div className="flex-1">
								<Skeleton className="h-6 w-3/4 mb-2" /> {/* name */}
								<Skeleton className="h-3 w-1/2 mb-4" /> {/* username */}
								<Skeleton className="h-5 w-2/3" /> {/* joined date */}
							</div>
						</div>
					) : (
						// 🔹 Real content
						<div className="flex items-start gap-4">
							<Avatar className="size-16 md:size-24 border-2 border-profile-accent">
								<AvatarImage
									src={profileDetails?.image}
									alt={profileDetails?.name}
								/>
								<AvatarFallback className="bg-profile-accent text-profile-dark text-2xl font-bold">
									{profileDetails?.name
										.split(" ")
										.map((n: string) => n[0])
										.join("")}
								</AvatarFallback>
							</Avatar>

							<div className="flex-1">
								<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
									<div>
										<h1 className="text-xl md:text-3xl font-bold text-foreground">
											{profileDetails?.name}
										</h1>

										{(profileDetails?.students as any)?.username && (
											<p className="text-profile-accent text-lg">
												{(profileDetails?.students as any)?.username}
											</p>
										)}

										<div className="flex mt-5 items-center gap-1">
											<CalendarRange className="w-4 h-4" />
											Joined:{" "}
											<p className="text-lime-400">
												{profileDetails?.createdAt &&
													new Intl.DateTimeFormat("en-US", {
														day: "2-digit",
														month: "short",
														year: "numeric",
														hour: "2-digit",
														minute: "2-digit",
													}).format(new Date(profileDetails?.createdAt))}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
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
					{isProfileDetailsPending && (
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
					{!isProfileDetailsPending && isProfileDetailsError && (
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
					{!isProfileDetailsPending &&
						!isProfileDetailsError &&
						profileDetails?.user_achievements?.length === 0 && (
							<div className="text-center p-6 text-muted-foreground">
								<IconLaurelWreath className="mx-auto size-8 text-primary mb-2" />
								<p>No Badges yet!</p>
							</div>
						)}

					{!isProfileDetailsPending && !isProfileDetailsError && (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
							{profileDetails?.user_achievements?.map(
								(
									badge: {
										claimed_at: string;
										nftCollection: string;
										achievements: any;
									},
									index: number
								) => {
									return (
										<Card
											key={index}
											className={`p-4 ring-1 ring-primary/30 border-primary/50`}
										>
											<div className="aspect-square rounded-lg bg-accent/10 flex items-center justify-center">
												{/* <Medal className="w-10 h-10 text-primary" /> */}
												<Image
													width={138}
													height={138}
													src={badge?.achievements?.badge_image}
													alt={badge?.achievements?.name}
												/>
											</div>
											<div className="mt-3">
												<CardTitle className="text-base flex items-center gap-2">
													{badge?.achievements.name}
													<TooltipInfo
														className="text-muted-foreground hidden md:flex"
														content={badge?.achievements.description}
													/>
												</CardTitle>

												<CardDescription className="flex gap-2 text-xs">
													Issued:
													<p className="text-lime-400 ">
														{" "}
														{profileDetails?.createdAt &&
															new Intl.DateTimeFormat("en-US", {
																day: "2-digit",
																month: "short",
																year: "numeric",
																hour: "2-digit",
																minute: "2-digit",
															}).format(new Date(badge?.claimed_at))}
													</p>
												</CardDescription>
												<CardDescription className="flex gap-2 text-xs">
													Collection:
													<p className="text-lime-400">
														{badge?.nftCollection}
													</p>
												</CardDescription>
											</div>
										</Card>
									);
								}
							)}
						</div>
					)}
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
										<Button disabled size="sm" variant="outline">
											View
										</Button>
										<Button disabled size="sm">
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
										<Button size="sm" disabled variant="outline">
											View
										</Button>
										<Button size="sm" disabled>
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

export default Page;
