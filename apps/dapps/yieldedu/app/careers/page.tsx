import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	ArrowRight,
	BookOpen,
	LineChart,
	Users,
	Lightbulb,
	Map,
} from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Metadata } from "next";
import { yieldEduMetadata } from "@/utils/metadata";

export const metadata: Metadata = {
	...yieldEduMetadata,
	title: "YieldEdu - Careers",
	description:
		"Join the YieldEdu team and help us revolutionize DeFi education and staking. Explore our open positions and apply today.",
};

export default function CareersPage() {
	return (
		<>
			<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none dark:block hidden bg-gradient-animated bg-400 animate-gradient">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#1a365d80,#0A0B1E)]"></div>
				<div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
				<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
			</div>
			<Header />
			<main className="space-y-8 container mx-auto px-5 md:max-w-5xl py-28">
				<section className="mb-10">
					<p className="mb-6 text-lg text-slate-600 dark:text-slate-300">
						YieldEdu Protocol is on a mission to revolutionize DeFi education
						and staking. We&apos;re looking for passionate, innovative thinkers
						to join our growing team and help us build the future of
						learn-to-earn.
					</p>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						<div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700/50 text-center">
							<Lightbulb className="w-10 h-10 mx-auto mb-3 text-lime-500" />
							<h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
								Innovation
							</h3>
							<p className="text-slate-600 dark:text-slate-300 text-sm">
								We&apos;re constantly pushing boundaries to create new,
								effective ways to learn and earn in DeFi.
							</p>
						</div>

						<div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700/50 text-center">
							<Users className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
							<h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
								Collaboration
							</h3>
							<p className="text-slate-600 dark:text-slate-300 text-sm">
								We believe in the power of diverse perspectives and work
								together to achieve our shared vision.
							</p>
						</div>

						<div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700/50 text-center">
							<Map className="w-10 h-10 mx-auto mb-3 text-lime-500" />
							<h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
								Remote-First
							</h3>
							<p className="text-slate-600 dark:text-slate-300 text-sm">
								We&apos;re a globally distributed team, working from wherever we
								feel most productive and inspired.
							</p>
						</div>
					</div>

					<div className="bg-gradient-to-r from-lime-50 to-yellow-50 dark:from-lime-500/10 dark:to-yellow-500/10 rounded-xl p-6 border border-lime-200 dark:border-lime-500/30 text-center">
						<h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
							Why Join YieldEdu?
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
							<div className="flex items-start gap-2">
								<div className="w-5 h-5 rounded-full bg-lime-500 flex items-center justify-center mt-1">
									<span className="text-white text-xs">✓</span>
								</div>
								<span className="text-slate-700 dark:text-slate-300">
									Competitive compensation with token incentives
								</span>
							</div>
							<div className="flex items-start gap-2">
								<div className="w-5 h-5 rounded-full bg-lime-500 flex items-center justify-center mt-1">
									<span className="text-white text-xs">✓</span>
								</div>
								<span className="text-slate-700 dark:text-slate-300">
									Flexible working hours and remote-first culture
								</span>
							</div>
							<div className="flex items-start gap-2">
								<div className="w-5 h-5 rounded-full bg-lime-500 flex items-center justify-center mt-1">
									<span className="text-white text-xs">✓</span>
								</div>
								<span className="text-slate-700 dark:text-slate-300">
									Continuous learning and development opportunities
								</span>
							</div>
							<div className="flex items-start gap-2">
								<div className="w-5 h-5 rounded-full bg-lime-500 flex items-center justify-center mt-1">
									<span className="text-white text-xs">✓</span>
								</div>
								<span className="text-slate-700 dark:text-slate-300">
									Health and wellness benefits
								</span>
							</div>
							<div className="flex items-start gap-2">
								<div className="w-5 h-5 rounded-full bg-lime-500 flex items-center justify-center mt-1">
									<span className="text-white text-xs">✓</span>
								</div>
								<span className="text-slate-700 dark:text-slate-300">
									Opportunity to shape the future of DeFi education
								</span>
							</div>
							<div className="flex items-start gap-2">
								<div className="w-5 h-5 rounded-full bg-lime-500 flex items-center justify-center mt-1">
									<span className="text-white text-xs">✓</span>
								</div>
								<span className="text-slate-700 dark:text-slate-300">
									Regular team retreats and meetups
								</span>
							</div>
						</div>
					</div>
				</section>

				<section className="mb-10">
					<h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
						Open Positions
					</h2>

					<div className="space-y-6">
						{/* <JobCard
							title="Senior Smart Contract Developer"
							department="Engineering"
							location="Remote"
							type="Full-time"
							icon={<Code className="w-10 h-10 text-lime-500" />}
						>
							<p className="mb-4">
								We're looking for an experienced Smart Contract Developer to
								help design, implement, and optimize our staking and rewards
								smart contracts.
							</p>
							<h4 className="font-semibold text-slate-900 dark:text-white mb-2">
								Requirements:
							</h4>
							<ul className="list-disc ml-5 space-y-1 mb-4">
								<li>
									3+ years of experience with Solidity and EVM-based blockchains
								</li>
								<li>
									Strong understanding of DeFi protocols and staking mechanisms
								</li>
								<li>Experience with smart contract security and auditing</li>
								<li>
									Familiarity with Web3 libraries and frontend integration
								</li>
							</ul>
						</JobCard> */}
						<JobCard
							title="Education Content Specialist"
							department="Education"
							location="Remote"
							type="Full-time"
							icon={<BookOpen className="w-10 h-10 text-yellow-500" />}
						>
							<>
								<p className="mb-4">
									Join our education team to create engaging, accessible content
									that helps users understand DeFi concepts and maximize their
									learning experience.
								</p>
								<h4 className="font-semibold text-slate-900 dark:text-white mb-2">
									Requirements:
								</h4>
								<ul className="list-disc ml-5 space-y-1 mb-4">
									<li>
										Deep understanding of DeFi, cryptocurrencies, and blockchain
									</li>
									<li>Proven experience creating educational content</li>
									<li>Excellent communication and simplification skills</li>
									<li>Experience with interactive learning formats</li>
								</ul>
							</>
						</JobCard>

						{/* <JobCard
							title="Frontend Developer"
							department="Engineering"
							location="Remote"
							type="Full-time"
							icon={<Code className="w-10 h-10 text-lime-500" />}
						>
							<>
								<p className="mb-4">
									We&apos;re seeking a talented Frontend Developer to help build
									and maintain our user interface, creating seamless and
									intuitive experiences for our users.
								</p>
								<h4 className="font-semibold text-slate-900 dark:text-white mb-2">
									Requirements:
								</h4>
								<ul className="list-disc ml-5 space-y-1 mb-4">
									<li>3+ years experience with React and Next.js</li>
									<li>
										Strong TypeScript skills and understanding of state
										management
									</li>
									<li>Experience with responsive design and accessibility</li>
									<li>Familiarity with Web3 libraries is a plus</li>
								</ul>
							</>
						</JobCard> */}

						<JobCard
							title="DeFi Analyst"
							department="Research"
							location="Remote"
							type="Full-time"
							icon={<LineChart className="w-10 h-10 text-yellow-500" />}
						>
							<>
								<p className="mb-4">
									Join our research team to analyze DeFi trends, staking
									protocols, and market opportunities to inform our product
									strategy and educational content.
								</p>
								<h4 className="font-semibold text-slate-900 dark:text-white mb-2">
									Requirements:
								</h4>
								<ul className="list-disc ml-5 space-y-1 mb-4">
									<li>Deep understanding of DeFi protocols and tokenomics</li>
									<li>Experience with data analysis and financial modeling</li>
									<li>Strong research skills and attention to detail</li>
									<li>Excellent communication and presentation abilities</li>
								</ul>
							</>
						</JobCard>
					</div>

					<div className="mt-8 text-center">
						<p className="text-slate-600 dark:text-slate-300 mb-4">
							Don&apos;t see a position that matches your skills? We&apos;re
							always looking for talented individuals.
						</p>
						<Link href={process.env.NEXT_PUBLIC_SUPPORT_MAIL!}>
							<Button className="bg-gradient-to-r from-lime-500 to-yellow-500 text-slate-900 font-semibold hover:opacity-90">
								Submit General Application
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</Link>
					</div>
				</section>
			</main>
			<Footer />
		</>
	);
}

function JobCard({
	title,
	department,
	location,
	type,
	icon,
	children,
}: {
	title: string;
	department: string;
	location: string;
	type: string;
	icon: React.ReactNode;
	children: React.ReactElement;
}) {
	return (
		<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
			<CardContent className="p-6">
				<div className="flex flex-col md:flex-row gap-6">
					<div className="md:w-16 flex md:flex-col items-center md:items-start gap-4 md:gap-0">
						<div className="w-16 h-16 rounded-xl bg-lime-100 dark:bg-lime-900/30 flex items-center justify-center shrink-0">
							{icon}
						</div>
					</div>
					<div className="flex-1">
						<div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
							<h3 className="text-xl font-semibold text-slate-900 dark:text-white">
								{title}
							</h3>
							<div className="flex flex-wrap gap-2">
								<Badge className="bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-700/30">
									{department}
								</Badge>
								<Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700/30">
									{location}
								</Badge>
								<Badge className="bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600/50">
									{type}
								</Badge>
							</div>
						</div>

						<div className="text-slate-600 dark:text-slate-300">{children}</div>

						<Link href={process.env.NEXT_PUBLIC_SUPPORT_MAIL!}>
							<Button className="bg-gradient-to-r from-lime-500 to-yellow-500 text-slate-900 font-semibold hover:opacity-90">
								Apply Now
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</Link>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
