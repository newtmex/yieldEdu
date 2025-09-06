import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { yieldEduMetadata } from "@/utils/metadata";
import { Metadata } from "next";

export const metadata: Metadata = {
	...yieldEduMetadata,
	title: "YieldEdu - About Us",
	description:
		"Learn more about YieldEdu, our mission, and our story. Join us in revolutionizing DeFi education.",
};

export default function Page() {
	return (
		<>
			<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none dark:block hidden bg-gradient-animated bg-400 animate-gradient">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#1a365d80,#0A0B1E)]"></div>
				<div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
				<div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20"></div>
			</div>
			<Header />
			<main className="space-y-20 py-28 px-5 container mx-auto md:max-w-4xl">
				<section className="mb-10">
					<div className=" mt-6">
						<h2 className="text-3xl font-bold mb-4 text-lime-500 dark:text-lime-400">
							Kamasah Dickson Founder & CEO
						</h2>
						<p className="text-md text-slate-600 italic dark:text-slate-300">
							A DeFi enthusiast, blockchain developer, and educator committed to
							making decentralized finance more accessible, practical, and
							rewarding in education. With hands-on experience in building Web3
							dapps, smart contracts, and DeFi protocols, he is bringing
							financial empowerment through education and staking incentives.
						</p>
					</div>
				</section>
				<section className="mb-10">
					<h2 className="text-3xl font-bold mb-4 text-lime-500 dark:text-lime-400">
						Our Mission
					</h2>
					<p className="mb-4">
						YieldEdu Protocol was founded with a simple yet powerful mission: to
						make DeFi education accessible, rewarding, and directly connected to
						real-world applications. We believe that the best way to learn is by
						doing, and the best incentive for learning is earning real rewards.
					</p>
					<p>
						Our learn-to-earn model bridges the gap between theoretical
						knowledge, practical experience and rewards, allowing students to
						gain valuable insights while educators earn for sharing their
						expertise.
					</p>
				</section>

				<section className="mb-10">
					<h2 className="text-3xl font-bold mb-4 text-lime-500 dark:text-lime-400">
						Our Story
					</h2>
					<p className="mb-4">
						YieldEdu was formally YieldStake and was conceived in 2024 by
						Kamasah Dickson who saw a critical gap in the market: plenty of
						educational resources existed for blockchain and DeFi, but few
						connected learning directly to earning opportunities.
					</p>
					<p className="mb-4">
						Determined to change this, we launched YieldEdu in 2024, combining
						interactive learning, staking opportunities, and on-chain
						incentives. Our approach quickly gained traction, and in 2025, we
						placed 4th in the DeFi category at the{" "}
						<a
							href="https://x.com/educhain_xyz"
							target="_blank"
							className="text-lime-400 underline"
						>
							EduChain{" "}
						</a>{" "}
						Semester 2 Hackathon, validating our vision of bridging education
						with real financial opportunities.
					</p>
					<p>
						Since then, we have helped thousands of students understand DeFi
						concepts while earning tangible rewards and pioneered new ways for
						educators to monetize their knowledge.
					</p>
				</section>

				<section className="mb-10">
					<h2 className="text-3xl font-bold mb-4 text-lime-500 dark:text-lime-400">
						Join the Community
					</h2>
					<p className="mb-4">
						Stay updated on our latest developments, product updates, and
						educational resources. 📢 Follow us on{" "}
						<a
							target="_blank"
							className="text-lime-400 underline"
							href={process.env.NEXT_PUBLIC_TWITTER_URL}
						>
							Twitter/X
						</a>{" "}
						and join our journey to revolutionize DeFi education!
					</p>
				</section>
				<section className="mb-10">
					<h2 className="text-3xl font-bold mb-4 text-lime-500 dark:text-lime-400">
						Our Values
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
						<div className="bg-white dark:bg-slate-800/60 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50">
							<h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-lime-400">
								Education First
							</h3>
							<p className="text-slate-600 dark:text-slate-300">
								We believe that understanding should precede investment. Our
								platform prioritizes clear, comprehensive education as the
								foundation for successful participation in DeFi.
							</p>
						</div>

						<div className="bg-white dark:bg-slate-800/60 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50">
							<h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-lime-400">
								Rewarding Excellence
							</h3>
							<p className="text-slate-600 dark:text-slate-300">
								We create systems that recognize and reward both learners for
								their progress and educators for their contributions to the
								community&apos;s knowledge base.
							</p>
						</div>

						<div className="bg-white dark:bg-slate-800/60 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50">
							<h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-lime-400">
								Community Driven
							</h3>
							<p className="text-slate-600 dark:text-slate-300">
								We believe in the power of community to drive innovation and
								growth. Our platform is designed to foster collaboration and
								knowledge sharing.
							</p>
						</div>

						<div className="bg-white dark:bg-slate-800/60 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50">
							<h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-lime-400">
								Transparency
							</h3>
							<p className="text-slate-600 dark:text-slate-300">
								We are committed to openness in our operations, clear
								communication about our services, and honest representation of
								the opportunities and risks in DeFi.
							</p>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</>
	);
}
