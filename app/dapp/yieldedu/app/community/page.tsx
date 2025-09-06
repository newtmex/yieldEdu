import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
	Users,
	MessageSquare,
	Calendar,
	Globe,
	Award,
	Github,
	Twitter,
	ArrowRight,
	Heart,
	Sparkles,
	BookOpen,
} from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import React from "react";
import { yieldEduMetadata } from "@/utils/metadata";
import { Metadata } from "next";

export const metadata: Metadata = {
	...yieldEduMetadata,
	title: "YieldEdu - Community",
	description:
		"Join the YieldEdu community to learn, share, and grow in the world of DeFi education. Connect with fellow students, educators, and enthusiasts.",
};

export default function CommunityPage() {
	return (
		<>
			<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none dark:block hidden bg-gradient-animated bg-400 animate-gradient">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#1a365d80,#0A0B1E)]"></div>
				<div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
				<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
			</div>
			<Header />
			<div className="space-y-8 container mx-auto px-5 py-28 md:max-w-5xl">
				<section className="mb-10">
					<p className="mb-6 text-lg text-slate-600 dark:text-slate-300">
						YieldEdu community brings together students, educators, and DeFi
						enthusiasts from around the world. Join us to share knowledge,
						discuss strategies, and help shape the future of DeFi education.
					</p>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						<CommunityStatCard
							icon={<Users className="w-8 h-8 text-lime-500" />}
							title="1,000+"
							description="Active Members"
						/>
						<CommunityStatCard
							icon={<MessageSquare className="w-8 h-8 text-yellow-500" />}
							title="100+"
							description="Forum Posts"
						/>
						<CommunityStatCard
							icon={<Globe className="w-8 h-8 text-lime-500" />}
							title="120+"
							description="Countries Represented"
						/>
					</div>
				</section>

				<section className="mb-10">
					<h2 className="text-2xl font-bold mb-6 text-lime-500 dark:text-lime-400">
						Join Our Community
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow">
							<CardHeader className="pb-2">
								<div className="flex items-center gap-2 mb-1">
									<MessageSquare className="w-5 h-5 text-lime-500" />
									<CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
										Discussion Forum
									</CardTitle>
								</div>
								<CardDescription className="text-slate-500 dark:text-slate-400">
									Engage in discussions about DeFi, staking strategies, and
									educational content
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50">
										<div className="flex justify-between items-start mb-2">
											<h4 className="font-medium text-slate-900 dark:text-white">
												Latest Discussions
											</h4>
											<Badge className="bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-700/30">
												Active
											</Badge>
										</div>
										<ul className="space-y-2">
											<li className="text-sm text-slate-600 dark:text-slate-300">
												Best strategies for maximizing APY boosts
											</li>
											<li className="text-sm text-slate-600 dark:text-slate-300">
												How to create engaging quizzes as an educator
											</li>
											<li className="text-sm text-slate-600 dark:text-slate-300">
												Understanding the relationship between learning and
												staking
											</li>
										</ul>
									</div>
									<a href={process.env.NEXT_PUBLIC_TELEGRAM} target="_blank">
										<Button className="w-full bg-gradient-to-r from-lime-500 to-yellow-500 text-slate-900 font-semibold hover:opacity-90">
											Visit Forum
											<ArrowRight className="ml-2 h-4 w-4" />
										</Button>
									</a>
								</div>
							</CardContent>
						</Card>

						<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow">
							<CardHeader className="pb-2">
								<div className="flex items-center gap-2 mb-1">
									<Calendar className="w-5 h-5 text-yellow-500" />
									<CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
										Events & Meetups
									</CardTitle>
								</div>
								<CardDescription className="text-slate-500 dark:text-slate-400">
									Join virtual and in-person events to connect with the
									community
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50">
										<div className="flex justify-between items-start mb-2">
											<h4 className="font-medium text-slate-900 dark:text-white">
												Upcoming Events
											</h4>
											<Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700/30">
												New
											</Badge>
										</div>
										<ul className="space-y-2">
											<li className="text-sm text-slate-600 dark:text-slate-300">
												<span className="font-medium">Mar 15:</span> DeFi
												Education Summit (Virtual)
											</li>
											<li className="text-sm text-slate-600 dark:text-slate-300">
												<span className="font-medium">Mar 22:</span> Staking
												Strategies Workshop
											</li>
											<li className="text-sm text-slate-600 dark:text-slate-300">
												<span className="font-medium">Apr 5:</span> YieldEdu
												Community Meetup - NYC
											</li>
										</ul>
									</div>
									<Button
										disabled
										className="w-full bg-gradient-to-r from-lime-500 to-yellow-500 text-slate-900 font-semibold hover:opacity-90"
									>
										View All Events
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</section>

				<section className="mb-10">
					<h2 className="text-2xl font-bold mb-6 text-lime-500 dark:text-lime-400">
						Connect With Us
					</h2>

					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
						<SocialCard
							icon={<Twitter className="w-6 h-6" />}
							name="Twitter"
							handle="@YieldEdu"
							color="bg-blue-500"
							url={process.env.NEXT_PUBLIC_TWITTER_URL}
						/>

						<SocialCard
							icon={<Github className="w-6 h-6" />}
							name="GitHub"
							handle="YieldEdu"
							color="bg-slate-800"
							url={process.env.NEXT_PUBLIC_GITHUB_URL}
						/>
						<SocialCard
							icon={<Globe className="w-6 h-6" />}
							name="Telegram"
							handle="YieldEdu Official"
							color="bg-sky-500"
							url={process.env.NEXT_PUBLIC_TELEGRAM}
						/>
					</div>
				</section>

				<section className="mb-10">
					<h2 className="text-2xl font-bold mb-6 text-lime-500 dark:text-lime-400">
						Ambassador Program
					</h2>

					<Card className="bg-gradient-to-r from-lime-50 to-yellow-50 dark:from-lime-500/10 dark:to-yellow-500/10 border border-lime-200 dark:border-lime-500/30">
						<CardContent className="p-6">
							<div className="flex flex-col md:flex-row gap-6">
								<div className="md:w-1/3">
									<div className="w-20 h-20 rounded-xl flex items-center justify-center mb-4 shadow-sm">
										<Award className="w-10 h-10 text-yellow-500" />
									</div>
									<h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
										Become an Ambassador
									</h3>
									<p className="text-slate-700 dark:text-slate-300 mb-4">
										Represent YieldEdu in your community, help others learn
										about DeFi, and earn exclusive rewards.
									</p>
									<Button
										disabled
										className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
									>
										Learn More
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</div>

								<div className="md:w-2/3 bg-white dark:bg-slate-800/60 rounded-xl p-5 border border-slate-200 dark:border-slate-700/50">
									<h4 className="font-semibold text-slate-900 dark:text-white mb-4">
										Ambassador Benefits
									</h4>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div className="flex items-start gap-2">
											<Sparkles className="w-5 h-5 text-yellow-500 mt-0.5" />
											<div>
												<h5 className="font-medium text-slate-900 dark:text-white">
													Exclusive Rewards
												</h5>
												<p className="text-sm text-slate-600 dark:text-slate-300">
													Earn special token bonuses and NFT badges
												</p>
											</div>
										</div>
										<div className="flex items-start gap-2">
											<BookOpen className="w-5 h-5 text-lime-500 mt-0.5" />
											<div>
												<h5 className="font-medium text-slate-900 dark:text-white">
													Early Access
												</h5>
												<p className="text-sm text-slate-600 dark:text-slate-300">
													Preview new features and courses before release
												</p>
											</div>
										</div>
										<div className="flex items-start gap-2">
											<Users className="w-5 h-5 text-yellow-500 mt-0.5" />
											<div>
												<h5 className="font-medium text-slate-900 dark:text-white">
													Network Growth
												</h5>
												<p className="text-sm text-slate-600 dark:text-slate-300">
													Build your professional network in DeFi
												</p>
											</div>
										</div>
										<div className="flex items-start gap-2">
											<Heart className="w-5 h-5 text-lime-500 mt-0.5" />
											<div>
												<h5 className="font-medium text-slate-900 dark:text-white">
													Community Impact
												</h5>
												<p className="text-sm text-slate-600 dark:text-slate-300">
													Help shape the future of DeFi education
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</section>

				<section>
					<h2 className="text-2xl font-bold mb-6 text-lime-500 dark:text-lime-400">
						Community Contributions
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow">
							<CardContent className="p-6">
								<div className="w-12 h-12 rounded-lg bg-lime-100 dark:bg-lime-900/30 flex items-center justify-center mb-4">
									<Github className="w-6 h-6 text-lime-500" />
								</div>
								<h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
									Open Source
								</h3>
								<p className="text-slate-600 dark:text-slate-300 mb-4">
									Contribute to our open source projects, including smart
									contracts, UI components, and educational content.
								</p>
								<a target="_blank" href={process.env.NEXT_PUBLIC_GITHUB_URL}>
									<Button variant="outline" className="w-full">
										View GitHub
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</a>
							</CardContent>
						</Card>

						<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow">
							<CardContent className="p-6">
								<div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4">
									<BookOpen className="w-6 h-6 text-yellow-500" />
								</div>
								<h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
									Content Creation
								</h3>
								<p className="text-slate-600 dark:text-slate-300 mb-4">
									Create educational content, tutorials, and guides to help
									others learn about DeFi and staking.
								</p>
								<Button disabled variant="outline" className="w-full">
									Content Guidelines
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</CardContent>
						</Card>

						<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow">
							<CardContent className="p-6">
								<div className="w-12 h-12 rounded-lg bg-lime-100 dark:bg-lime-900/30 flex items-center justify-center mb-4">
									<Globe className="w-6 h-6 text-lime-500" />
								</div>
								<h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
									Translations
								</h3>
								<p className="text-slate-600 dark:text-slate-300 mb-4">
									Help make YieldEdu accessible to a global audience by
									contributing translations in your language.
								</p>
								<Button disabled variant="outline" className="w-full">
									Translation Portal
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</CardContent>
						</Card>
					</div>
				</section>
			</div>
			<Footer />
		</>
	);
}

function CommunityStatCard({
	icon,
	title,
	description,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
}) {
	return (
		<div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700/50 text-center">
			<div className="flex justify-center mb-4">{icon}</div>
			<h3 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">
				{title}
			</h3>
			<p className="text-slate-600 dark:text-slate-300">{description}</p>
		</div>
	);
}

function SocialCard({
	icon,
	name,
	handle,
	color,
	url,
}: {
	icon: React.ReactNode;
	name: string;
	handle: string;
	color: string;
	url?: string;
}) {
	return (
		<Link href={url!} target="_blank">
			<div className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700/50 hover:shadow-md transition-shadow flex items-center gap-3">
				<div
					className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white`}
				>
					{icon}
				</div>
				<div>
					<h3 className="font-medium text-slate-900 dark:text-white">{name}</h3>
					<p className="text-sm text-slate-500 dark:text-slate-400">{handle}</p>
				</div>
			</div>
		</Link>
	);
}
