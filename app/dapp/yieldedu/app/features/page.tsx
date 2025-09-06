import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { featuresData } from "@/data/features";
import { yieldEduMetadata } from "@/utils/metadata";
import {
	GraduationCap,
	Lock,
	Users,
	Sparkles,
	Shield,
	BookOpen,
	Wallet,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
	...yieldEduMetadata,
	title: "YieldEdu - Features",
	description:
		"Discover the unique features of YieldEdu Protocol. Learn-to-earn, staking rewards, and more.",
};

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
				<div className="w-12 h-12 rounded-lg bg-lime-100 dark:bg-lime-900/30 flex items-center justify-center mb-4">
					{icon}
				</div>
				<h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
					{title}
				</h3>
				<p className="text-slate-600 dark:text-slate-300">{description}</p>
			</CardContent>
		</Card>
	);
}

const FeaturesPage = () => {
	return (
		<>
			<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none dark:block hidden bg-gradient-animated bg-400 animate-gradient">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#1a365d80,#0A0B1E)]"></div>
				<div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
				<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
			</div>
			<Header />
			<main className="space-y-20 container py-28 px-5 md:max-w-5xl mx-auto">
				<section className="mb-10">
					<h2 className="text-3xl font-bold mb-4 text-lime-500 dark:text-lime-400">
						Overview
					</h2>
					<p className="mb-4">
						YieldEdu Protocol combines educational content with real DeFi
						staking opportunities, creating a unique learn-to-earn ecosystem
						where knowledge translates directly into rewards.
					</p>
					<p>
						Our platform is designed for both students looking to learn about
						DeFi while earning rewards and educators seeking to create engaging
						learning experiences and earn rewards.
					</p>
				</section>

				<section className="mb-10">
					<h2 className="text-3xl font-bold mb-6 text-lime-500 dark:text-lime-400">
						Core Features
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
				</section>

				<section className="mb-10">
					<h2 className="text-3xl font-bold mb-6 text-lime-500 dark:text-lime-400">
						For Students
					</h2>

					<div className="bg-white dark:bg-slate-800/60 rounded-xl p-6 border border-slate-200 dark:border-slate-700/50 mb-6">
						<h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
							<GraduationCap className="w-5 h-5 text-lime-500" />
							Learning Experience
						</h3>
						<ul className="space-y-3">
							<li className="flex items-start gap-2">
								<Badge className="mt-1 bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-700/30">
									Interactive
								</Badge>
								<span className="text-slate-700 dark:text-slate-300">
									Engaging content with videos, quizzes, and practical exercises
								</span>
							</li>
							<li className="flex items-start gap-2">
								<Badge className="mt-1 bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-700/30">
									Structured
								</Badge>
								<span className="text-slate-700 dark:text-slate-300">
									Progressive learning path from basics to advanced concepts
								</span>
							</li>
							<li className="flex items-start gap-2">
								<Badge className="mt-1 bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-700/30">
									Tracked
								</Badge>
								<span className="text-slate-700 dark:text-slate-300">
									Monitor your progress and identify areas for improvement
								</span>
							</li>
							<li className="flex items-start gap-2">
								<Badge className="mt-1 bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-700/30">
									Certified
								</Badge>
								<span className="text-slate-700 dark:text-slate-300">
									Earn verifiable certificates upon course completion
								</span>
							</li>
						</ul>
					</div>

					<div className="bg-white dark:bg-slate-800/60 rounded-xl p-6 border border-slate-200 dark:border-slate-700/50">
						<h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
							<Wallet className="w-5 h-5 text-yellow-500" />
							Staking & Rewards
						</h3>
						<ul className="space-y-3">
							<li className="flex items-start gap-2">
								<Badge className="mt-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700/30">
									APY Boost
								</Badge>
								<span className="text-slate-700 dark:text-slate-300">
									Increase your staking APY by 15%+ based on learning
									achievements
								</span>
							</li>
							<li className="flex items-start gap-2">
								<Badge className="mt-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700/30">
									Token Rewards
								</Badge>
								<span className="text-slate-700 dark:text-slate-300">
									Earn bonus tokens for completing modules and achieving high
									scores
								</span>
							</li>
							<li className="flex items-start gap-2">
								<Badge className="mt-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700/30">
									Reduced Lock
								</Badge>
								<span className="text-slate-700 dark:text-slate-300">
									Qualify for shorter lock periods without sacrificing rewards
								</span>
							</li>
							<li className="flex items-start gap-2">
								<Badge className="mt-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700/30">
									Real Yield
								</Badge>
								<span className="text-slate-700 dark:text-slate-300">
									Stake with institutional-grade security and competitive base
									APY
								</span>
							</li>
						</ul>
					</div>
				</section>

				<section className="mb-10">
					<h2 className="text-3xl font-bold mb-6 text-lime-500 dark:text-lime-400">
						For Educators
					</h2>

					<div className="bg-white dark:bg-slate-800/60 rounded-xl p-6 border border-slate-200 dark:border-slate-700/50 mb-6">
						<h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
							<BookOpen className="w-5 h-5 text-lime-500" />
							Course Creation
						</h3>
						<ul className="space-y-3">
							<li className="flex items-start gap-2">
								<Badge className="mt-1 bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-700/30">
									Intuitive
								</Badge>
								<span className="text-slate-700 dark:text-slate-300">
									User-friendly tools to create engaging educational content
								</span>
							</li>
							<li className="flex items-start gap-2">
								<Badge className="mt-1 bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-700/30">
									Multimedia
								</Badge>
								<span className="text-slate-700 dark:text-slate-300">
									Support for videos, interactive exercises, quizzes, and
									assignments
								</span>
							</li>
							<li className="flex items-start gap-2">
								<Badge className="mt-1 bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-700/30">
									Templates
								</Badge>
								<span className="text-slate-700 dark:text-slate-300">
									Pre-designed templates for different learning objectives and
									formats
								</span>
							</li>
							<li className="flex items-start gap-2">
								<Badge className="mt-1 bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-700/30">
									Analytics
								</Badge>
								<span className="text-slate-700 dark:text-slate-300">
									Detailed insights into student engagement and performance
								</span>
							</li>
						</ul>
					</div>

					<div className="bg-white dark:bg-slate-800/60 rounded-xl p-6 border border-slate-200 dark:border-slate-700/50">
						<h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
							<Sparkles className="w-5 h-5 text-yellow-500" />
							Revenue Generation
						</h3>
						<ul className="space-y-3">
							<li className="flex items-start gap-2">
								<Badge className="mt-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700/30">
									Enrollment
								</Badge>
								<span className="text-slate-700 dark:text-slate-300">
									Earn tokens based on student enrollments and completion rates
								</span>
							</li>
							<li className="flex items-start gap-2">
								<Badge className="mt-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700/30">
									Rewards Pool
								</Badge>
								<span className="text-slate-700 dark:text-slate-300">
									Share in a percentage of staking yield generated by your
									students
								</span>
							</li>
							<li className="flex items-start gap-2">
								<Badge className="mt-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700/30">
									Premium
								</Badge>
								<span className="text-slate-700 dark:text-slate-300">
									Option to offer premium courses.
								</span>
							</li>
							{/* <li className="flex items-start gap-2">
								<Badge className="mt-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700/30">
									Royalties
								</Badge>
								<span className="text-slate-700 dark:text-slate-300">
									Ongoing royalties when your content is used in affiliated
									platforms
								</span>
							</li> */}
						</ul>
					</div>
				</section>

				<section className="mb-10">
					<h2 className="text-3xl font-bold mb-6 text-lime-500 dark:text-lime-400">
						Security & Compliance
					</h2>

					<div className="bg-white dark:bg-slate-800/60 rounded-xl p-6 border border-slate-200 dark:border-slate-700/50">
						<ul className="space-y-5">
							<li>
								<h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white flex items-center gap-2">
									<Shield className="w-5 h-5 text-lime-500" />
									OCID Authentication
								</h3>
								<p className="text-slate-700 dark:text-slate-300">
									Secure authentication via OpenID Connect (OCID) ensures your
									identity is verified as a student through trusted providers
									while maintaining privacy and security.
								</p>
							</li>
							<li>
								<h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white flex items-center gap-2">
									<Lock className="w-5 h-5 text-lime-500" />
									Smart Contract Security
								</h3>
								<p className="text-slate-700 dark:text-slate-300">
									All staking operations are governed by audited smart contracts
									that have undergone rigorous security assessments by
									blockchain security auditors.
								</p>
							</li>
							<li>
								<h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white flex items-center gap-2">
									<Users className="w-5 h-5 text-lime-500" />
									Data Protection
								</h3>
								<p className="text-slate-700 dark:text-slate-300">
									We comply with global data protection regulations, including
									GDPR and CCPA, ensuring your personal information is handled
									with the utmost care and transparency.
								</p>
							</li>
							<li>
								<h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white flex items-center gap-2">
									<Sparkles className="w-5 h-5 text-lime-500" />
									Regulatory Compliance
								</h3>
								<p className="text-slate-700 dark:text-slate-300">
									Our platform is designed with regulatory considerations in
									mind, implementing necessary safeguards to operate within
									legal frameworks across different jurisdictions.
								</p>
							</li>
						</ul>
					</div>
				</section>
			</main>
			<Footer />
		</>
	);
};

export default FeaturesPage;
