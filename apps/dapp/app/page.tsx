"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import Image from "next/image";
import dashboardImage from "@/public/dashboard.png";
import dashboardWhiteImage from "@/public/dashboard-white.png";
import { Particles } from "@/components/Particles";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";
import { featuresData } from "@/data/features";
import LoginButton from "../components/LoginButton";
import { useOCAuth } from "@opencampus/ocid-connect-js";
// import { useOCAuth } from "@opencampus/ocid-connect-js";

export default function Page() {
	const { theme } = useTheme();
	const [color, setColor] = useState("#ffffff");
	const [userType, setUserType] = useState<"student" | "educator">("student");
	const { authState } = useOCAuth();

	useEffect(() => {
		setColor(theme === "dark" ? "#a3e635" : "#000000");
	}, [theme]);

	const [themedDashboardImage, setThemedDashboardImage] = useState(
		theme === "dark" ? dashboardWhiteImage : dashboardImage
	);

	useEffect(() => {
		setThemedDashboardImage(
			theme === "light" ? dashboardWhiteImage : dashboardImage
		);
	}, [theme]);

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-[#0A0B1E] text-slate-900 dark:text-slate-100 transition-colors duration-200">
			{/* Animated background - only visible in dark mode */}
			<div className="fixed inset-0 overflow-hidden pointer-events-none dark:block hidden">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#1a365d,#0A0B1E)]"></div>
				<div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
				<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
			</div>
			<Particles
				className="absolute h-screen inset-0 z-10"
				quantity={80}
				size={2}
				ease={80}
				color={color}
				refresh
			/>

			<Header />

			<main className="relative z-10">
				{/* Hero Section */}
				<section className="py-20 md:py-32">
					<div className="container mx-auto px-4">
						<div className="grid grid-col-1 xl:grid-cols-2 items-center gap-12">
							<div className="p-5">
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5 }}
								>
									<Badge className="mb-4 bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-700/30 px-3 py-1">
										Web3 Education Reimagined
									</Badge>
									<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-slate-900 dark:text-white">
										Learn, Stake &{" "}
										<span className="bg-clip-text text-transparent bg-gradient-to-r from-lime-500 to-yellow-500">
											Earn
										</span>{" "}
										in the World of DeFi
									</h1>
									<p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl">
										YieldEdu combines education with real-world DeFi staking,
										allowing you to earn while you learn.
									</p>

									<div className="space-y-6">
										{!authState?.isAuthenticated && (
											<Tabs
												defaultValue={userType}
												className="w-full max-w-md"
												onValueChange={(value) =>
													setUserType(value as "student" | "educator")
												}
											>
												<TabsList className="grid w-full grid-cols-2 dark:bg-slate-800 bg-slate-200">
													<TabsTrigger
														disabled
														value="educator"
														className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-500 data-[state=active]:text-white dark:data-[state=active]:text-slate-900"
													>
														<BookOpen className="w-4 h-4 mr-2" />
														Educator
													</TabsTrigger>
													<TabsTrigger
														value="student"
														className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-lime-500 data-[state=active]:to-lime-500 data-[state=active]:text-white dark:data-[state=active]:text-slate-900"
													>
														<GraduationCap className="w-4 h-4 mr-2" />
														Student
													</TabsTrigger>
												</TabsList>
											</Tabs>
										)}

										<div className="flex flex-col sm:flex-row gap-4">
											{userType === "student" ? (
												<LoginButton userType={userType} />
											) : (
												<Button
													disabled
													size="lg"
													className={cn(
														"text-white dark:text-slate-900 font-semibold hover:opacity-90 px-8",
														{
															"bg-gradient-to-r from-yellow-500 to-yellow-600":
																userType === "educator",
														}
													)}
												>
													Connect Wallet as Educator
												</Button>
											)}
										</div>

										{userType == "student" && !authState?.isAuthenticated && (
											<p className="text-sm text-slate-500 dark:text-slate-400">
												Secure authentication via Open Campus ID (OCID)
											</p>
										)}
									</div>
								</motion.div>
							</div>

							<div className="p-5">
								<motion.div
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.5, delay: 0.2 }}
									className="relative"
								>
									<div className="absolute -inset-0.5 bg-gradient-to-r from-lime-500 to-yellow-500 rounded-2xl blur opacity-30 dark:opacity-50"></div>
									<div className="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/50 shadow-xl">
										<Image
											src={themedDashboardImage}
											alt="YieldEDU"
											className="w-full h-auto"
											priority
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-slate-500/80 dark:from-slate-900/80 to-transparent flex items-end p-8">
											<div className="pb-7">
												<h3 className="text-white text-xl font-semibold">
													Interactive Learning
												</h3>
												<p className="text-slate-200 text-sm">
													Track your progress, earn guaranteed rewards, and
													boost your APY
												</p>
											</div>
										</div>
									</div>

									{/* Floating cards */}
									<div className="absolute -top-6 -right-6 bg-white dark:bg-slate-800 rounded-lg p-3 shadow-lg border border-slate-200 dark:border-slate-700/50 flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-lime-100 dark:bg-lime-900/30 flex items-center justify-center">
											<Trophy className="w-5 h-5 text-lime-600 dark:text-lime-400" />
										</div>
										<div>
											<p className="text-sm font-medium text-slate-900 dark:text-white">
												+15% APY
											</p>
											<p className="text-xs text-slate-500 dark:text-slate-400">
												Learning Bonus
											</p>
										</div>
									</div>

									<div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 rounded-lg p-3 shadow-lg border border-slate-200 dark:border-slate-700/50 flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
											<Users className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
										</div>
										<div>
											<p className="text-sm font-medium text-slate-900 dark:text-white">
												10,000+
											</p>
											<p className="text-xs text-slate-500 dark:text-slate-400">
												Active Learners
											</p>
										</div>
									</div>
								</motion.div>
							</div>
						</div>
					</div>
				</section>

				<section
					id="features"
					className="py-20 bg-slate-200/50 dark:bg-slate-900/30"
				>
					<div className="container mx-auto px-4">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.7, ease: "easeOut" }}
							viewport={{ once: true }}
							className="text-center mb-16"
						>
							<Badge className="mb-4 bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-700/30 px-3 py-1">
								Platform Features
							</Badge>
							<h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
								Why Choose{" "}
								<span className="bg-clip-text text-transparent bg-gradient-to-r from-lime-500 to-yellow-500">
									YieldEdu
								</span>
							</h2>
							<p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
								Our platform combines educational content with real DeFi staking
								opportunities, creating a unique learn-to-earn ecosystem.
							</p>
						</motion.div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{featuresData.map(({ Icon, title, description }) => {
								return (
									<FeatureCard
										key={title}
										icon={<Icon className="w-6 h-6 text-yellow-500" />}
										title=""
										description={description}
									/>
								);
							})}
						</div>
					</div>
				</section>

				{/* How It Works */}
				<section id="how-it-works" className="py-20 px-5">
					<div className="container mx-auto px-4">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.7, ease: "easeOut" }}
							viewport={{ once: true }}
							className="text-center mb-16"
						>
							<Badge className="mb-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700/30 px-3 py-1">
								Simple Process
							</Badge>
							<h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
								How YieldEdu{" "}
								<span className="bg-clip-text text-transparent bg-gradient-to-r from-lime-500 to-yellow-500">
									Works
								</span>
							</h2>
							<p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
								Get started in just a few simple steps and begin your journey to
								earning while learning.
							</p>
						</motion.div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
							<StepCard
								number="01"
								title="Connect with OCID"
								description="Securely authenticate using OpenID Connect as a student or educator."
							/>
							<StepCard
								number="02"
								title="Learn DeFi Concepts"
								description="Complete interactive lessons and quizzes to understand DeFi fundamentals."
							/>
							<StepCard
								number="03"
								title="Stake & Earn Rewards"
								description="Apply your knowledge by staking tokens and earning real yield with APY boosts."
							/>
						</div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.7, ease: "easeOut" }}
							viewport={{ once: true }}
							className="mt-16 text-center"
						>
							<LoginButton userType="student" />
						</motion.div>
					</div>
				</section>

				{/* Testimonials */}
				<section
					id="testimonials"
					className="py-20 bg-slate-200/50 dark:bg-slate-900/30"
				>
					<div className="container mx-auto px-4">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.7, ease: "easeOut" }}
							viewport={{ once: true }}
							className="text-center mb-16"
						>
							<Badge className="mb-4 bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-700/30 px-3 py-1">
								Success Stories
							</Badge>
							<h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
								What Our Users{" "}
								<span className="bg-clip-text text-transparent bg-gradient-to-r from-lime-500 to-yellow-500">
									Say
								</span>
							</h2>
							<p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
								Hear from students and educators who have transformed their DeFi
								knowledge and earnings.
							</p>
						</motion.div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							<TestimonialCard
								quote="YieldEdu completely changed how I approach DeFi education."
								name="Sarah"
								role="Developer"
								image=""
								type="educator"
							/>
							<TestimonialCard
								quote="I went from knowing nothing about DeFi to having a staking portfolio."
								name="Michael"
								role="Student"
								image=""
								type="student"
							/>
							<TestimonialCard
								quote="I learnt more on defi on this platform and now I am earning passively"
								name="Emma"
								role="DeFi Enthusiast"
								image=""
								type="educator"
							/>
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="py-20">
					<div className="container mx-auto px-4">
						<div className="relative overflow-hidden rounded-3xl">
							<div className="absolute inset-0 bg-gradient-to-r from-lime-500 to-yellow-500 opacity-90"></div>
							<div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=1200')] mix-blend-overlay opacity-20"></div>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.7, ease: "easeOut" }}
								viewport={{ once: true }}
								className="relative py-16 px-8 md:py-24 md:px-16 text-center"
							>
								<h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
									Ready to Start Your DeFi Learning Journey?
								</h2>
								<p className="text-lg text-white/90 max-w-2xl mx-auto mb-10">
									Join thousands of students and educators on YieldEdu and
									transform your understanding of DeFi while earning real
									rewards.
								</p>

								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<LoginButton
										userType="student"
										className="bg-white text-slate-900 font-semibold hover:bg-white/60 px-8"
									/>
								</div>
							</motion.div>
						</div>
					</div>
				</section>
			</main>

			{/* Footer */}
			<Footer />
		</div>
	);
}

function FeatureCard({
	icon,
	title,
	description,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
}) {
	return (
		<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
			<CardContent className="p-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, ease: "easeOut" }}
					viewport={{ once: true }}
				>
					<div className="w-12 h-12 rounded-lg bg-lime-100 dark:bg-lime-900/30 flex items-center justify-center mb-4">
						{icon}
					</div>
					<h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
						{title}
					</h3>
					<p className="text-slate-600 dark:text-slate-300">{description}</p>
				</motion.div>
			</CardContent>
		</Card>
	);
}

function StepCard({
	number,
	title,
	description,
}: {
	number: string;
	title: string;
	description: string;
}) {
	return (
		<motion.div
			className="relative"
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.7, ease: "easeOut" }}
			viewport={{ once: true }}
		>
			<div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-gradient-to-r from-lime-500 to-yellow-500 flex items-center justify-center text-white font-bold text-sm">
				{number}
			</div>
			<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm ml-6">
				<CardContent className="p-6">
					<h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
						{title}
					</h3>
					<p className="text-slate-600 dark:text-slate-300">{description}</p>
				</CardContent>
			</Card>
		</motion.div>
	);
}

function TestimonialCard({
	quote,
	name,
	role,
	image,
	type,
}: {
	quote: string;
	name: string;
	role: string;
	image: string;
	type: string;
}) {
	return (
		<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm">
			<CardContent className="p-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, ease: "easeOut" }}
					viewport={{ once: true }}
				>
					<div
						className={`w-full h-1 rounded-full ${
							type === "educator" ? "bg-yellow-500" : "bg-lime-500"
						} mb-6`}
					></div>
					<p className="text-slate-600 dark:text-slate-300 mb-6 italic">
						{quote}
					</p>
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 rounded-full overflow-hidden">
							<Image
								src={image || "/placeholder.png"}
								alt={name}
								width={48}
								height={48}
								className="w-full h-full object-cover"
							/>
						</div>
						<div>
							<h4 className="font-semibold text-slate-900 dark:text-white">
								{name}
							</h4>
							<p className="text-sm text-slate-500 dark:text-slate-400">
								{role}
							</p>
						</div>
					</div>
				</motion.div>
			</CardContent>
		</Card>
	);
}
