import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";

import { Mail, Phone, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Metadata } from "next";

import { yieldEduMetadata } from "@/utils/metadata";
import FaqItem from "@/components/FaqItem";
export const metadata: Metadata = {
	...yieldEduMetadata,
	title: "YieldEdu - Support",
	description:
		"YieldEdu - Contact our support team for assistance with your YieldEdu account, staking, and more.",
};

const page = () => {
	const MINIMUM_EDU_TOKENS = " 100 EDU tokens";
	return (
		<>
			<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none dark:block hidden bg-gradient-animated bg-400 animate-gradient">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#1a365d80,#0A0B1E)]"></div>
				<div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
				<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
			</div>
			<Header />
			<main className="container mx-auto px-5 py-28 md:max-w-5xl">
				<section>
					<h2 className="text-2xl font-bold mb-6 text-lime-500 dark:text-lime-400">
						Contact Support
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow">
							<CardContent className="p-6">
								<div className="w-12 h-12 rounded-lg bg-lime-100 dark:bg-lime-900/30 flex items-center justify-center mb-4">
									<Mail className="w-6 h-6 text-lime-500" />
								</div>
								<h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
									Email Support
								</h3>
								<p className="text-slate-600 dark:text-slate-300 mb-4">
									Send us an email and we&apos;ll get back to you within 24
									hours.
								</p>
								<Link href={process.env.NEXT_PUBLIC_SUPPORT_MAIL!}>
									<Button variant="outline" className="w-full">
										kamasahdickson19@gmail.com
									</Button>
								</Link>
							</CardContent>
						</Card>

						<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow">
							<CardContent className="p-6">
								<div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4">
									<MessageCircle className="w-6 h-6 text-yellow-500" />
								</div>
								<h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
									Live Chat
								</h3>
								<p className="text-slate-600 dark:text-slate-300 mb-4">
									Chat with our support team in real-time during business hours.
								</p>
								<Button
									disabled
									variant="outline"
									className="w-full flex justify-between"
								>
									Start Chat
									{/* <Badge className="ml-2 bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-700/30">
											Online
										</Badge> */}
									<Badge className="ml-2 bg-lime-100 dark:bg-lime-900/30 text-gray-500 dark:border-lime-700/30">
										offline
									</Badge>
								</Button>
							</CardContent>
						</Card>

						<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow">
							<CardContent className="p-6">
								<div className="w-12 h-12 rounded-lg bg-lime-100 dark:bg-lime-900/30 flex items-center justify-center mb-4">
									<Phone className="w-6 h-6 text-lime-500" />
								</div>
								<h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
									Phone Support
								</h3>
								<p className="text-slate-600 dark:text-slate-300 mb-4">
									For premium users, get direct phone support from our team.
								</p>
								<Button disabled variant="outline" className="w-full">
									View Phone Hours
								</Button>
							</CardContent>
						</Card>
					</div>
				</section>
				<section className="mb-10 py-20">
					<h2 className="text-2xl font-bold mb-6 text-lime-500 dark:text-lime-400">
						Frequently Asked Questions
					</h2>

					<div className="space-y-4">
						<FaqItem
							question="What is YieldEdu Protocol?"
							answer="YieldEdu Protocol is a learn-to-earn platform that combines DeFi education with real staking opportunities. Users can earn rewards by learning about DeFi concepts and staking their tokens, while educators can monetize their knowledge by creating courses and content."
						/>
						<FaqItem
							question="How do I earn rewards on YieldEdu?"
							answer="You can earn rewards in two main ways: by staking your tokens to earn APY, and by completing educational content to earn APY boosts and bonus tokens. The more you learn, the higher your potential rewards."
						/>
						<FaqItem
							question="What tokens can I stake on YieldEdu?"
							answer="Currently, YieldEdu supports staking of EDU tokens and our native platform token. We plan to expand support for additional tokens in the future based on community feedback and governance decisions."
						/>
						<FaqItem
							question="Is there a minimum amount required to stake?"
							answer={`Yes, the minimum staking amount is ${MINIMUM_EDU_TOKENS}. This minimum helps ensure efficient operation of the staking protocol and meaningful rewards for participants.`}
						/>
						<FaqItem
							question="How secure is YieldEdu Protocol?"
							answer="Security is our top priority. We use OCID for student authentication, implement industry-standard security practices, and our smart contracts have undergone rigorous audits by security auditors. We also maintain a bug bounty program to continuously improve our security posture."
						/>
					</div>
				</section>
				{/*
				<section className="mb-10">
					<h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
						Popular Topics
					</h2>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-sm">
							<CardHeader className="pb-2">
								<div className="flex items-center gap-2">
									<BookOpen className="w-5 h-5 text-lime-500" />
									<CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
										Learning
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent>
								<ul className="space-y-3">
									<HelpLink title="How do I access courses?" />
									<HelpLink title="How are learning rewards calculated?" />
									<HelpLink title="Can I create my own learning content?" />
									<HelpLink title="How do quizzes affect my rewards?" />
									<HelpLink title="What happens if I fail a quiz?" />
								</ul>
							</CardContent>
						</Card>

						<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-sm">
							<CardHeader className="pb-2">
								<div className="flex items-center gap-2">
									<Wallet className="w-5 h-5 text-yellow-500" />
									<CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
										Staking
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent>
								<ul className="space-y-3">
									<HelpLink title="How do I start staking?" />
									<HelpLink title="What are the minimum staking requirements?" />
									<HelpLink title="How is APY calculated?" />
									<HelpLink title="When can I withdraw my staked tokens?" />
									<HelpLink title="What happens if I unstake early?" />
								</ul>
							</CardContent>
						</Card>

						<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-sm">
							<CardHeader className="pb-2">
								<div className="flex items-center gap-2">
									<Shield className="w-5 h-5 text-lime-500" />
									<CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
										Account & Security
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent>
								<ul className="space-y-3">
									<HelpLink title="How do I set up OCID authentication?" />
									<HelpLink title="How to secure my account?" />
									<HelpLink title="What if I forget my password?" />
									<HelpLink title="How to enable two-factor authentication?" />
									<HelpLink title="Can I change my email address?" />
								</ul>
							</CardContent>
						</Card>

						<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 shadow-sm">
							<CardHeader className="pb-2">
								<div className="flex items-center gap-2">
									<Users className="w-5 h-5 text-yellow-500" />
									<CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
										For Educators
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent>
								<ul className="space-y-3">
									<HelpLink title="How to become an educator?" />
									<HelpLink title="How are educator rewards calculated?" />
									<HelpLink title="Guidelines for creating courses" />
									<HelpLink title="How to track student progress?" />
									<HelpLink title="Tools for creating interactive content" />
								</ul>
							</CardContent>
						</Card>
					</div> 
				</section>
                    */}
			</main>
			<Footer />
		</>
	);
};

export default page;

// function HelpLink({ title }: { title: string }) {
// 	return (
// 		<li>
// 			<Link
// 				href={`/help-center/article/${title
// 					.toLowerCase()
// 					.replace(/\s+/g, "-")
// 					.replace(/[?]/g, "")}`}
// 			>
// 				<div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
// 					<span className="text-slate-700 dark:text-slate-300">{title}</span>
// 					<ChevronRight className="w-4 h-4 text-slate-400" />
// 				</div>
// 			</Link>
// 		</li>
// 	);
// }
