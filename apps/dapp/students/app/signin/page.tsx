"use client";

import React, { useState } from "react";
import { IconBrandX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { signIn } from "@/lib/auth-client";
import yieldeduIcon from "@/public/yieldedu.png";
import { toast } from "sonner";

const GoogleIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="size-6"
		viewBox="0 0 48 48"
	>
		<path
			fill="#FFC107"
			d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z"
		/>
		<path
			fill="#FF3D00"
			d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
		/>
		<path
			fill="#4CAF50"
			d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
		/>
		<path
			fill="#1976D2"
			d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z"
		/>
	</svg>
);

// --- TYPE DEFINITIONS ---

export interface Testimonial {
	avatarSrc: string;
	name: string;
	handle: string;
	text: string;
}

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
	<div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
		{children}
	</div>
);

// --- MAIN COMPONENT ---

const Page = () => {
	const [magicLinkLoading, setMagicLinkLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);
	const [twitterLoading, setTwitterLoading] = useState(false);
	const [ocidLoading, setOCIDLoading] = useState(false);

	const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const email = formData.get("email");
		const data: { email: string } = {
			email: typeof email === "string" ? email : "",
		};

		try {
			if (!email) {
				toast.error("email is required");
				return;
			}
			await signIn.magicLink(
				{
					email: data.email,
					callbackURL: "/",
				},
				{
					onRequest: () => {
						toast.loading("Magic link being created...");
						setMagicLinkLoading(true);
					},
					onResponse: (ctx) => {
						if (!ctx.response.ok) {
							throw new Error(ctx.response.statusText);
						}
						if (ctx.response.ok) {
							toast.dismiss();
							toast.success("Magic link has been sent");
							setMagicLinkLoading(false);
						}
					},
				}
			);
		} catch (error: any) {
			console.log(error);
			toast.dismiss();
			setMagicLinkLoading(false);
			toast.error("Error signin in. Please try again", {
				description: error.message,
			});
		}
	};

	const disabled =
		magicLinkLoading || googleLoading || twitterLoading || ocidLoading;
	return (
		<>
			<div className="bg-background text-foreground">
				<div className="min-h-screen flex flex-col lg:flex-row font-geist">
					{/* Left column: sign-in form */}
					<section className="flex-1 flex items-center justify-center p-8">
						<div className="w-full max-w-md">
							<div className="flex flex-col gap-6">
								<div className="flex items-center animate-element animate-delay-100  gap-2">
									<Image
										src={yieldeduIcon}
										alt="yieldedu"
										className="h-auto w-10 sm:w-14"
									/>

									<h1 className="text-4xl md:text-5xl leading-tight">
										<span className="font-medium text-foreground tracking-tighter">
											Sign In
										</span>
									</h1>
								</div>
								<p className="animate-element animate-delay-200 text-muted-foreground">
									Enter your email below to login to your account
								</p>

								<form className="space-y-4" onSubmit={handleSignIn}>
									<div className="animate-element animate-delay-300">
										<GlassInputWrapper>
											<input
												disabled={disabled}
												name="email"
												type="email"
												placeholder="m@example.com"
												className="w-full bg-transparent text-sm p-4  rounded-2xl focus:outline-none"
											/>
										</GlassInputWrapper>
									</div>

									<Button
										disabled={disabled}
										loading={magicLinkLoading}
										type="submit"
										className="animate-element disabled:bg-primary/80 animate-delay-600 w-full rounded-2xl bg-primary h-14 font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
									>
										{!magicLinkLoading && "Log-in / Sign-in with Magic Link"}
									</Button>
								</form>

								<div className="animate-element animate-delay-700 relative flex items-center justify-center">
									<span className="w-full border-t border-border"></span>
									<span className="px-4 text-sm text-muted-foreground bg-background absolute">
										Or continue with
									</span>
								</div>
								<div className="flex flex-wrap items-center gap-4">
									<Button
										loading={googleLoading}
										disabled={disabled}
										variant={"ghost"}
										onClick={async () => {
											setGoogleLoading(true);
											setTwitterLoading(false);
											setMagicLinkLoading(false);
											setOCIDLoading(false);
											await signIn.social(
												{
													provider: "google",
													callbackURL: "/",
												},
												{
													onRequest: () => {
														toast.loading("Authenticating with google");
													},
													onResponse: (ctx) => {
														setGoogleLoading(false);
														toast.dismiss();
														if (!ctx.response.ok) {
															toast.error("Google Authentication failed");
														}
													},
												}
											);
										}}
										className="animate-element animate-delay-800 flex-1 basis-0 min-w-[120px] max-w-full items-center justify-center gap-3 border border-border rounded-2xl h-14 hover:bg-gray-400/20 bg-secondary transition-colors"
										style={{ flexShrink: 0 }}
									>
										{!googleLoading && <GoogleIcon />}
									</Button>
									<Button
										disabled={disabled}
										onClick={async () => {
											setTwitterLoading(true);
											setGoogleLoading(false);
											setMagicLinkLoading(false);
											setOCIDLoading(false);

											await signIn.social(
												{
													provider: "twitter",
													callbackURL: "/",
												},
												{
													onRequest: () => {
														toast.loading("Authenticating with X");
													},
													onResponse: (ctx) => {
														setTwitterLoading(false);
														toast.dismiss();
														if (!ctx.response.ok) {
															toast.error("X Authentication failed");
														}
													},
												}
											);
										}}
										className="animate-element aspect-square animate-delay-800 flex-1 basis-0 min-w-[56px] max-w-full items-center justify-center gap-3 border border-border rounded-2xl h-14 hover:bg-gray-400/20 bg-secondary  transition-colors"
										style={{ flexShrink: 0 }}
									>
										{!twitterLoading && (
											<IconBrandX className="size-6 text-black dark:text-white" />
										)}
									</Button>
								</div>
							</div>
						</div>
					</section>
				</div>
			</div>
		</>
	);
};

export default Page;
