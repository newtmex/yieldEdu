"use client";

import Image from "next/image";
import yuzuHero from "@/public/yuzu.svg";
import Navigation from "@/components/navbar";
import {
	LayoutGroup,
	motion,
	useMotionTemplate,
	useMotionValue,
} from "framer-motion";
import Link from "next/link";
import { PlasticButton } from "@/components/plastic-button";
import { EarnYuzu } from "@/components/how-to-earn-yuzu";
import Footer from "@/components/footer";
import { Faq } from "@/components/faq";
import { TextRotate } from "@/components/text-rotate";
import CommunityCTA from "@/components/community-cta";

const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

const Page = () => {
	const color = useMotionValue(COLORS_TOP[0]);
	const border = useMotionTemplate`1px solid ${color}`;
	const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

	return (
		<div className="w-full h-screen relative">
			<Navigation />

			<main>
				{/* Hero Section */}
				<section className="relative overflow-clip min-h-screen">
					{/* Hero Image */}
					<Image
						alt="yuzu-heatwave"
						src={yuzuHero}
						layout="fill"
						objectFit="cover"
						className="absolute inset-0 h-full w-full z-0"
					/>
					<div
						className="absolute inset-0 z-1"
						style={{
							background:
								"radial-gradient(ellipse at center, rgba(0,0,0,0) 20%, rgba(0,0,0,0.7))",
						}}
					/>
					<div className="absolute inset-0 z-1 grainy" />

					<p className=" absolute left-1/2 text-center -translate-x-1/2 bottom-24 text-lg text-[#00353B] font-bold mb-12 max-w-md mx-auto leading-relaxed">
						YieldEdu gives you a way to earn Yuzu while impacting the future of
						Education.
					</p>
					<div className="flex gap-5 justify-center w-full absolute bottom-20 items-center mt-auto">
						<motion.button
							disabled
							style={{
								border,
								boxShadow,
							}}
							whileHover={{
								scale: 1.015,
							}}
							whileTap={{
								scale: 0.985,
							}}
							className="group disabled:opacity-20 relative flex size-fit items-center gap-1.5 rounded-full z-20 cursor-pointer px-7 py-2 text-gray-50 transition-colors bg-gray-950/50"
						>
							Start Learning
						</motion.button>
						<Link
							target="_blank"
							href={process.env.NEXT_PUBLIC_INVESTORS_DASHBOARD_URL!}
						>
							<PlasticButton text="Launch App" className="z-30" />
						</Link>
					</div>
				</section>

				{/* What is Yuzu Section - Moved before investor/student sections */}
				<section className="py-16 bg-white/10 backdrop-blur-sm">
					<div className="container mx-auto px-4">
						<div className="max-w-2xl mx-auto text-center">
							<h2 className="text-4xl font-bold text-primary mb-8">
								What is Yuzu?
							</h2>

							<p className="text-lg text-primary/80 leading-relaxed">
								Yuzu Points are on-chain rewards within the EDU Chain ecosystem.
								They cannot be traded, but they are earned through participation
								and investment. On YieldEdu, Yuzu is proof of your learning
								journey or your contribution to funding education.
							</p>
						</div>
					</div>
				</section>

				<EarnYuzu />
				<Faq />
				<div className="w-full h-full text-2xl sm:text-3xl md:text-5xl flex flex-row items-center justify-center font-overusedGrotesk bg-white dark:text-muted text-foreground font-light overflow-hidden p-12 sm:p-20 md:p-24">
					<LayoutGroup>
						<motion.p className="flex whitespace-pre" layout>
							<motion.span
								className="pt-0.5 sm:pt-1 md:pt-2"
								layout
								transition={{ type: "spring", damping: 30, stiffness: 400 }}
							>
								Turn Education into{" "}
							</motion.span>
							<TextRotate
								texts={[
									"ownership.",
									"opportunity.",
									"yield. ✽",
									"credentials.",
									"impact.",
									"🕶️🕶️🕶️",
								]}
								mainClassName="text-white px-2 sm:px-2 md:px-3 bg-lime-400 overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
								staggerFrom={"last"}
								initial={{ y: "100%" }}
								animate={{ y: 0 }}
								exit={{ y: "-120%" }}
								staggerDuration={0.025}
								splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
								transition={{ type: "spring", damping: 30, stiffness: 400 }}
								rotationInterval={2000}
							/>
						</motion.p>
					</LayoutGroup>
				</div>
				<CommunityCTA />
				<Footer />
			</main>
		</div>
	);
};

export default Page;
