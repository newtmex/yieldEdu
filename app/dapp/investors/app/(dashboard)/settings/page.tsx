"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	IconApps,
	IconBrandTelegram,
	IconBrandX,
	IconBrightness,
	IconLock,
	IconUserBolt,
} from "@tabler/icons-react";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ThemeSwitcher from "@/components/theme-switcher";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { useAppKit } from "@reown/appkit/react";
import { useRouter, useSearchParams } from "next/navigation";
const Page = () => {
	const [disableUpdate, setDisableUpdate] = useState(true);
	const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
	const { address, isConnected } = useAccount();
	const { open } = useAppKit();
	const queryClient = useQueryClient();
	const searchParams = useSearchParams();
	const currentTab = searchParams.get("tab") || "profile";
	const router = useRouter();

	const FormSchema = z.object({
		name: z.string().min(5, {
			message: "Name must be at least 5 characters.",
		}),
		username: z.string().min(5, {
			message: "Username must be at least 5 characters.",
		}),
		email: z.string().email({
			message: "Please enter a valid email address.",
		}),
	});

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			name: "",
			username: "",
			email: "",
		},
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		try {
			setIsUpdatingProfile(true);

			const { error } = await supabase.from("investors").upsert(
				{
					...data,
					address,
				},
				{
					onConflict: "address",
				}
			);

			if (error) throw error;

			if (error) {
				throw error;
			}

			toast.success("Profile updated successfully");
			await queryClient.invalidateQueries({ queryKey: ["profile-details"] });

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.log(error);
			toast.error("Could not update profile", {
				description: error.message || "Something went wrong.",
			});
		} finally {
			setIsUpdatingProfile(false);
		}
	}

	const {
		data: profileDetails,
		isPending: isProfileDetailsPending,
		isError: isProfileDetailsError,
		error: profileDetailsError,
	} = useQuery({
		queryKey: ["profile-details"],
		queryFn: async () => {
			const response = await supabase
				.from("investors")
				.select("*")
				.eq("address", address)
				.single();

			return response.data;
		},
		enabled: !!address,
	});

	useEffect(() => {
		if (isProfileDetailsError && profileDetailsError) {
			toast.error("Could not fetch profile details", {
				description: profileDetailsError.message,
			});
		}
	}, [isProfileDetailsError, profileDetailsError]);

	useEffect(() => {
		const subscription = form.watch((formValues) => {
			const isDifferent = Object.keys(formValues).some((key) => {
				const originalValue =
					profileDetails?.[key as keyof z.infer<typeof FormSchema>];
				const currentValue =
					formValues[key as keyof z.infer<typeof FormSchema>];

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const normalize = (val: any) =>
					val === null || val === undefined ? "" : String(val).trim();

				return normalize(originalValue) !== normalize(currentValue);
			});

			// Check if there are changes in form data
			setDisableUpdate(!isDifferent);
		});

		return () => subscription.unsubscribe();
	}, [form, profileDetails]);

	const handleTabChange = (tab: string) => {
		const params = new URLSearchParams(Array.from(searchParams.entries()));
		params.set("tab", tab);
		router.replace(`?${params.toString()}`, { scroll: false }); // keep scroll position
	};

	useEffect(() => {
		if (profileDetails) {
			form.reset({
				name: profileDetails.name || "",
				username: profileDetails.username || "",
				email: profileDetails.email || "",
			});
		}
	}, [profileDetails, form]);

	return (
		<div className="w-full p-5">
			<Tabs
				defaultValue={currentTab}
				onValueChange={handleTabChange}
				className="flex flex-col md:flex-row gap-5"
			>
				<TabsList className="md:flex-col gap-2 h-full flex-[15%] items-start bg-transparent">
					<TabsTrigger
						value="profile"
						className="w-full group justify-start flex gap-3 dark:data-[state=active]:!bg-lime-500/10 dark:data-[state=active]:!text-lime-400 dark:hover:!text-lime-500 hover:data-[state=active]:!bg-transparent hover:data-[state=active]:!text-lime-600 data-[state=active]:!text-lime-600 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none"
					>
						<IconUserBolt className="size-5" />
						<p className="group-hover:underline group-data-[state=active]:no-underline">
							Profile
						</p>
					</TabsTrigger>
					<TabsTrigger
						disabled
						value="connected-apps"
						className="w-full group justify-start flex gap-3 dark:data-[state=active]:!bg-lime-500/10 dark:data-[state=active]:!text-lime-400 dark:hover:!text-lime-500 hover:data-[state=active]:!bg-transparent hover:data-[state=active]:!text-lime-600 data-[state=active]:!text-lime-600 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none"
					>
						<IconApps className="size-5" />{" "}
						<p className="flex items-center gap-2 group-hover:underline group-data-[state=active]:no-underline">
							Connected Apps <IconLock />
						</p>
					</TabsTrigger>
					<TabsTrigger
						value="theme"
						className="w-full group justify-start flex gap-3 dark:data-[state=active]:!bg-lime-500/10 dark:data-[state=active]:!text-lime-400 dark:hover:!text-lime-500 hover:data-[state=active]:!bg-transparent hover:data-[state=active]:!text-lime-600 data-[state=active]:!text-lime-600 data-[state=active]:!bg-transparent data-[state=active]:!shadow-none"
					>
						<IconBrightness className="size-5" />{" "}
						<p className="group-hover:underline group-data-[state=active]:underline dark:group-data-[state=active]:no-underline">
							Theme
						</p>
					</TabsTrigger>
				</TabsList>
				<div className="flex-3/4 p-5 md:py-0">
					{isConnected ? (
						<TabsContent value="profile" className="max-w-full md:max-w-xl">
							<h2 className="text-xl font-semibold">Profile</h2>
							<p className="text-sm pb-4">Update your profile details.</p>
							<Separator />

							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="space-y-6 py-5"
								>
									<FormField
										disabled={isProfileDetailsPending || isUpdatingProfile}
										control={form.control}
										name="name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Name</FormLabel>
												<FormControl>
													<Input placeholder="Your name" {...field} />
												</FormControl>
												<FormDescription>
													This is the name that will be displayed on your
													profile and in emails.
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										disabled={isProfileDetailsPending || isUpdatingProfile}
										name="username"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Username</FormLabel>
												<FormControl>
													<div className="relative">
														<span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary text-sm">
															@
														</span>
														<Input
															placeholder="john_doe"
															{...field}
															className="pl-7"
														/>
													</div>
												</FormControl>
												<FormDescription>
													This is your public display name. It can be your real
													name or a pseudonym. You can only change this once
													every 30 days.
												</FormDescription>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										disabled={isProfileDetailsPending || isUpdatingProfile}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email</FormLabel>
												<FormControl>
													<Input placeholder="johndoe@gmail.com" {...field} />
												</FormControl>

												<FormMessage />
											</FormItem>
										)}
									/>

									<Button
										disabled={
											isProfileDetailsPending ||
											disableUpdate ||
											isUpdatingProfile
										}
										type="submit"
									>
										{isProfileDetailsPending
											? "fetching profile details..."
											: isUpdatingProfile
											? "Updating profile..."
											: "Update Account"}
									</Button>
								</form>
							</Form>
						</TabsContent>
					) : (
						<TabsContent value="profile" className="max-w-full md:max-w-xl">
							<div className="flex flex-col items-center justify-center text-center space-y-4 border border-muted rounded-xl p-6 bg-muted/40">
								<h2 className="text-xl font-semibold">Wallet Not Connected</h2>
								<p className="text-sm text-muted-foreground max-w-sm">
									You need to connect your wallet to view and update your
									profile information.
								</p>
								<Button variant="outline" onClick={() => open()}>
									Connect Wallet
								</Button>
							</div>
						</TabsContent>
					)}
					<TabsContent
						value="connected-apps"
						className="max-w-full md:max-w-xl"
					>
						<h2 className="text-xl font-semibold">Connected Apps</h2>
						<p className="text-sm pb-4">
							Securely link your external accounts to YieldEdu to unlock
							personalized experiences, and access exclusive rewards.
						</p>
						<Separator />

						{/* =============== connected apps============= */}
						<div className="py-5 space-y-5">
							<ConnectedAppCard
								icon={<IconBrandTelegram className="w-5 h-5" />} // Replace with your actual icon
								name="Telegram"
								connected={false}
							/>

							<ConnectedAppCard
								icon={<IconBrandX className="w-5 h-5" />} // Replace with your actual icon
								name="Twitter"
								connected={false}
							/>
						</div>
					</TabsContent>
					<TabsContent value="theme" className="max-w-full md:max-w-xl">
						<h2 className="text-xl font-semibold">Theme Preferences</h2>
						<p className="text-sm pb-4">
							{" "}
							Choose between light and dark mode to customize the look and feel
							of YieldEDU
						</p>
						<Separator />
						<ThemeSwitcher />
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
};

export default Page;

function ConnectedAppCard({
	icon,
	name,
	connected,
}: {
	icon: React.ReactNode;
	name: string;
	connected?: boolean;
}) {
	return (
		<Card className="flex flex-row items-center justify-between p-4 dark:bg-muted/20">
			<div className="flex items-center gap-4">
				<div className="p-2 bg-muted rounded-md">{icon}</div>
				<div>
					<p className="font-medium text-sm">{name}</p>
				</div>
			</div>

			<div className="flex items-center gap-2">
				{connected ? (
					<Button
						variant="secondary"
						className="text-xs px-3 py-1 cursor-default"
						disabled
					>
						Connected
					</Button>
				) : (
					<Button size="sm">Connect</Button>
				)}
			</div>
		</Card>
	);
}
