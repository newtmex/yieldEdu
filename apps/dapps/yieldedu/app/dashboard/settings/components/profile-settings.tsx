"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export function ProfileSettings() {
	const [isLoading, setIsLoading] = useState(false);

	// In a real app, this would be fetched from an API
	const [userData, setUserData] = useState({
		name: "Alex Johnson",
		username: "alex_defi",
		bio: "DeFi enthusiast and yield farming specialist. Learning and earning in the crypto space since 2019.",
		email: "alex@example.com",
		avatar: "/placeholder.svg?height=100&width=100",
		timezone: "America/New_York",
		publicProfile: true,
	});

	const handleSave = async () => {
		setIsLoading(true);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));

		setIsLoading(false);
		toast({
			title: "Profile updated",
			description: "Your profile has been updated successfully.",
			variant: "default",
		});
	};

	return (
		<div className="space-y-6">
			<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm">
				<CardHeader>
					<CardTitle>Profile Information</CardTitle>
					<CardDescription>
						Update your personal information and how others see you on the
						platform
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex flex-col gap-6 md:flex-row">
						<div className="flex flex-col items-center space-y-2">
							<Avatar className="h-24 w-24">
								<AvatarImage src={userData.avatar} alt={userData.name} />
								<AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
							</Avatar>
							<Button
								variant="default"
								size="sm"
								className="relative cursor-pointer overflow-clip"
							>
								<div className="text-xs flex items-center cursor-pointer">
									<Camera className="mr-2 h-3 w-3" />
									Change
									<span className="sr-only">Change avatar</span>
								</div>
								<Input
									type="file"
									className="absolute inset-0 hover:!cursor-pointer opacity-0"
									accept="image/*"
									aria-label="Change avatar"
								/>
							</Button>
						</div>
						<div className="flex-1 space-y-4">
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="name">Full Name</Label>
									<Input
										className="bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:!ring-slate-500 dark:focus:!ring-lime-500 focus:!border-transparent focus:ring-offset-2 dark:ring-offset-lime-700 ring-offset-slate-700"
										id="name"
										value={userData.name}
										onChange={(e) =>
											setUserData({ ...userData, name: e.target.value })
										}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="username">Username</Label>
									<Input
										className="bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:!ring-slate-500 dark:focus:!ring-lime-500 focus:!border-transparent focus:ring-offset-2 dark:ring-offset-lime-700 ring-offset-slate-700"
										id="username"
										value={userData.username}
										onChange={(e) =>
											setUserData({ ...userData, username: e.target.value })
										}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="bio">Bio</Label>
								<Textarea
									id="bio"
									placeholder="Tell us about yourself"
									value={userData.bio}
									onChange={(e) =>
										setUserData({ ...userData, bio: e.target.value })
									}
									className="bg-slate-100 resize-none dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:!ring-slate-500 dark:focus:!ring-lime-500 focus:!border-transparent focus:ring-offset-2 dark:ring-offset-lime-700 ring-offset-slate-700"
									rows={4}
								/>
								<p className="text-xs text-muted-foreground">
									Brief description for your profile. URLs are hyperlinked.
								</p>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="email">Email Address</Label>
							<Input
								id="email"
								className="bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:!ring-slate-500 dark:focus:!ring-lime-500 focus:!border-transparent focus:ring-offset-2 dark:ring-offset-lime-700 ring-offset-slate-700"
								type="email"
								value={userData.email}
								onChange={(e) =>
									setUserData({ ...userData, email: e.target.value })
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="timezone">Timezone</Label>
							<Select
								value={userData.timezone}
								onValueChange={(value) =>
									setUserData({ ...userData, timezone: value })
								}
							>
								<SelectTrigger
									className="bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:!ring-slate-500 dark:focus:!ring-lime-500 focus:!border-transparent focus:ring-offset-2 dark:ring-offset-lime-700 ring-offset-slate-700"
									id="timezone"
								>
									<SelectValue placeholder="Select timezone" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>North America</SelectLabel>
										<SelectItem value="America/New_York">
											Eastern Time (ET)
										</SelectItem>
										<SelectItem value="America/Chicago">
											Central Time (CT)
										</SelectItem>
										<SelectItem value="America/Denver">
											Mountain Time (MT)
										</SelectItem>
										<SelectItem value="America/Los_Angeles">
											Pacific Time (PT)
										</SelectItem>
									</SelectGroup>
									<SelectGroup>
										<SelectLabel>Europe</SelectLabel>
										<SelectItem value="Europe/London">GMT (UTC+0)</SelectItem>
										<SelectItem value="Europe/Paris">
											Central European Time (CET)
										</SelectItem>
										<SelectItem value="Europe/Helsinki">
											Eastern European Time (EET)
										</SelectItem>
									</SelectGroup>
									<SelectGroup>
										<SelectLabel>Asia & Pacific</SelectLabel>
										<SelectItem value="Asia/Tokyo">
											Japan Standard Time (JST)
										</SelectItem>
										<SelectItem value="Asia/Singapore">
											Singapore Time (SGT)
										</SelectItem>
										<SelectItem value="Australia/Sydney">
											Australian Eastern Time (AET)
										</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardContent>
				<CardFooter className="flex justify-end">
					<Button onClick={handleSave} disabled={isLoading}>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Save Changes
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
