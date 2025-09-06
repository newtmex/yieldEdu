import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { ArrowRight } from "lucide-react";
// import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Metadata } from "next";
import { yieldEduMetadata } from "@/utils/metadata";

export const metadata: Metadata = {
	...yieldEduMetadata,
	title: "YieldEdu - Blogs",
	description:
		"Explore our latest blogs and articles on DeFi, tutorials, and education. Stay updated with YieldEdu's insights and community news.",
};

export default function BlogPage() {
	const categories = [
		{
			name: "Defi",
			value: 0,
		},
		{
			name: "Tutorials",
			value: 0,
		},
		{
			name: "Education",
			value: 0,
		},
		{
			name: "News",
			value: 0,
		},
		{
			name: "Community",
			value: 0,
		},
	];
	return (
		<>
			<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none dark:block hidden bg-gradient-animated bg-400 animate-gradient">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#1a365d80,#0A0B1E)]"></div>
				<div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
				<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
			</div>
			<Header />
			<main className="container mx-auto md:max-w-7xl px-5 py-28 space-y-8">
				<div className="mt-10">
					<h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
						Categories
					</h2>
					<div className="flex flex-wrap gap-3">
						{categories.map((cat) => {
							return (
								<Button
									key={cat.name}
									type="button"
									variant="ghost"
									className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer px-3 py-1"
								>
									<Badge className="bg-transparent hover:bg-transparent text-slate-500">
										{cat.name}{" "}
										<span className="ml-1 text-slate-400 dark:text-slate-500">
											({cat.value})
										</span>
									</Badge>
								</Button>
							);
						})}
					</div>
				</div>

				<p className="text-center grid place-content-center text-3xl h-[60vh]">
					No new blogs
				</p>
				{/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
						<div className="aspect-video relative">
							<img
								src="/placeholder.svg?height=300&width=600"
								alt="Blog Post Image"
								className="w-full h-full object-cover"
							/>
						</div>
						<CardContent className="p-6">
							<div className="mb-4">
								<Badge className="bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-700/30">
									DeFi
								</Badge>
								<span className="text-xs text-slate-500 dark:text-slate-400 ml-3">
									March 10, 2025
								</span>
							</div>
							<h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
								Understanding the Impact of APY Boosts in DeFi Staking
							</h3>
							<p className="text-slate-600 dark:text-slate-300 mb-4">
								Learn how APY boosts work in DeFi staking platforms and how to
								maximize your earnings through strategic staking approaches.
							</p>
							<Link href="/blog/apy-boosts">
								<Button
									variant="link"
									className="p-0 h-auto font-semibold text-lime-600 dark:text-lime-400 hover:text-lime-800 dark:hover:text-lime-300"
								>
									Read More <ArrowRight className="ml-1 h-4 w-4" />
								</Button>
							</Link>
						</CardContent>
					</Card>

					<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
						<div className="aspect-video relative">
							<img
								src="/placeholder.svg?height=300&width=600"
								alt="Blog Post Image"
								className="w-full h-full object-cover"
							/>
						</div>
						<CardContent className="p-6">
							<div className="mb-4">
								<Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700/30">
									Education
								</Badge>
								<span className="text-xs text-slate-500 dark:text-slate-400 ml-3">
									March 5, 2025
								</span>
							</div>
							<h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
								The Future of Learn-to-Earn: Transforming Education in Web3
							</h3>
							<p className="text-slate-600 dark:text-slate-300 mb-4">
								Explore how learn-to-earn models are revolutionizing education
								in the web3 space and creating new opportunities for both
								students and educators.
							</p>
							<Link href="/blog/learn-to-earn">
								<Button
									variant="link"
									className="p-0 h-auto font-semibold text-lime-600 dark:text-lime-400 hover:text-lime-800 dark:hover:text-lime-300"
								>
									Read More <ArrowRight className="ml-1 h-4 w-4" />
								</Button>
							</Link>
						</CardContent>
					</Card>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
						<div className="aspect-video relative">
							<img
								src="/placeholder.svg?height=200&width=400"
								alt="Blog Post Image"
								className="w-full h-full object-cover"
							/>
						</div>
						<CardContent className="p-4">
							<div className="mb-2">
								<Badge className="bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-700/30 text-xs">
									Tutorial
								</Badge>
								<span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
									Feb 28, 2025
								</span>
							</div>
							<h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
								Beginner's Guide to Staking on YieldEdu
							</h3>
							<p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
								A step-by-step tutorial for newcomers looking to start staking
								on YieldEdu Protocol.
							</p>
							<Link href="/blog/beginners-guide">
								<Button
									variant="link"
									className="p-0 h-auto text-sm font-semibold text-lime-600 dark:text-lime-400 hover:text-lime-800 dark:hover:text-lime-300"
								>
									Read More <ArrowRight className="ml-1 h-3 w-3" />
								</Button>
							</Link>
						</CardContent>
					</Card>

					<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
						<div className="aspect-video relative">
							<img
								src="/placeholder.svg?height=200&width=400"
								alt="Blog Post Image"
								className="w-full h-full object-cover"
							/>
						</div>
						<CardContent className="p-4">
							<div className="mb-2">
								<Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700/30 text-xs">
									Market Analysis
								</Badge>
								<span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
									Feb 22, 2025
								</span>
							</div>
							<h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
								Q1 2025 DeFi Market Analysis
							</h3>
							<p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
								A comprehensive look at DeFi trends and performance in the first
								quarter of 2025.
							</p>
							<Link href="/blog/q1-2025-analysis">
								<Button
									variant="link"
									className="p-0 h-auto text-sm font-semibold text-lime-600 dark:text-lime-400 hover:text-lime-800 dark:hover:text-lime-300"
								>
									Read More <ArrowRight className="ml-1 h-3 w-3" />
								</Button>
							</Link>
						</CardContent>
					</Card>

					<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
						<div className="aspect-video relative">
							<img
								src="/placeholder.svg?height=200&width=400"
								alt="Blog Post Image"
								className="w-full h-full object-cover"
							/>
						</div>
						<CardContent className="p-4">
							<div className="mb-2">
								<Badge className="bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-700/30 text-xs">
									News
								</Badge>
								<span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
									Feb 15, 2025
								</span>
							</div>
							<h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
								YieldEdu Protocol Announces New Educator Rewards Program
							</h3>
							<p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
								Learn about our enhanced rewards system for educators
								contributing to the platform.
							</p>
							<Link href="/blog/educator-rewards">
								<Button
									variant="link"
									className="p-0 h-auto text-sm font-semibold text-lime-600 dark:text-lime-400 hover:text-lime-800 dark:hover:text-lime-300"
								>
									Read More <ArrowRight className="ml-1 h-3 w-3" />
								</Button>
							</Link>
						</CardContent>
					</Card>
				</div> */}
			</main>
			<Footer />
		</>
	);
}
