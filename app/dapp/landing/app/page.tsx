"use client";

import { Faq } from "@/components/faq";
import { Features } from "@/components/features";
import { Hero } from "@/components/hero";
import Navigation from "@/components/navbar";
import { TextRotate } from "@/components/text-rotate";
import { Button } from "@/components/ui/button";
import { IconBrandTelegram, IconBrandX } from "@tabler/icons-react";
import { LayoutGroup, motion } from "framer-motion";
import Link from "next/link";
import React from "react";
import Footer from "@/components/footer";
import MarqueSection from "@/components/MarqueSection";
import CommunityCTA from "@/components/community-cta";

export default function Page() {
	return (
		<div className="w-full h-screen relative">
			<Navigation />
			<Hero />
			<MarqueSection />
			<Features />
			<CTAsection />
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
		</div>
	);
}

const CTAsection = () => {
	return (
		<section className="py-32 container px-6 xl:px-12">
			<div className="container">
				<div className="grid items-center gap-8 lg:grid-cols-2">
					<div className="flex flex-col items-center text-center lg:items-start lg:text-left">
						<h1 className="my-6 mt-0 text-4xl font-semibold text-balance lg:text-5xl">
							Own the Future of Learning
						</h1>
						<p className="mb-8 max-w-xl text-muted-foreground lg:text-lg">
							Whether you're here to fund the next generation or unlock
							knowledge for yourself, YieldEdu gives you the tools to make every
							credential count—on-chain, transparent, and rewarding.
						</p>
						<div className="flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start">
							<Button asChild>
								<Link
									href={process.env.NEXT_PUBLIC_INVESTORS_DASHBOARD_URL!}
									target="_blank"
								>
									Go to Investor Dashboard
								</Link>
							</Button>
							<Button disabled variant="outline">
								{/* <Link href={buttonSecondary.href!} target="_blank"> */}
								Start Learning
								{/* </Link> */}
							</Button>
						</div>
					</div>
					<img
						src={"/future.webp"}
						alt={"placeholder hero"}
						className="max-h-96 w-full rounded-md object-cover"
					/>
				</div>
			</div>
		</section>
	);
};
