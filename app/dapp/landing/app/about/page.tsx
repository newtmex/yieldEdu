"use client";

import Navigation from "@/components/navbar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import aboutBanner from "@/public/about-banner.webp";
import Footer from "@/components/footer";
import MarqueSection from "@/components/MarqueSection";
import { Faq } from "@/components/faq";
import { PlasticButton } from "@/components/plastic-button";
import Link from "next/link";

const Page = () => {
	return (
		<>
			<Navigation />

			<section className="py-32">
				<div className="container mx-auto">
					<div className="px-8 md:px-16 mb-14 grid gap-5 text-center md:grid-cols-2 md:text-left">
						<h1 className="text-5xl font-semibold">About Us</h1>
					</div>
					<div className="grid gap-7 px-8 md:px-16 lg:grid-cols-3">
						<Image
							src={aboutBanner}
							alt={"YieldEDU"}
							className="size-full max-h-[900px] rounded-xl object-cover lg:col-span-2"
						/>
						<div className="flex flex-col gap-7 md:flex-row lg:flex-col">
							<div className="flex flex-col justify-between gap-6 rounded-xl bg-[#FBEEE5] p-7 md:w-1/2 lg:w-auto">
								<svg
									height={48}
									className="mr-auto"
									viewBox="0 0 400 464"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M200 217V100.5L76.5 158L200 217Z" fill={"white"} />
									<path
										d="M106.5 261.5V187.5L200 232C200.5 265.167 201.1 330.3 199.5 325.5C197.5 319.5 189.065 299.333 164.5 278C145.5 261.5 118 259.5 106.5 261.5Z"
										fill={"white"}
									/>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M0 263.5V0H195H198.5H399.5C399.863 46.8802 399.699 133.954 399.581 195.85L399.581 195.904C399.537 219.144 399.5 238.83 399.5 251.5C399.5 301.3 380.155 321.857 366.643 336.215L366.636 336.222C365.906 336.998 365.192 337.756 364.5 338.5L200.5 464C184.867 452.128 160.418 433.749 134.654 414.383C102.187 389.978 67.6329 364.004 46 347.5C7.19999 317.9 -1.03339e-05 281 0 263.5ZM378 20.5H198.5H195H21V245.5C21 294.254 38.8206 312.851 48.2527 322.694L48.2567 322.698C48.6896 323.15 49.1049 323.583 49.5 324L200.5 438C223.333 420.333 279.2 377.3 320 346.5C366.5 314 374 293.5 378 267.5V20.5Z"
										fill={"white"}
									/>
									<path
										d="M200.5 35V99L324 157L200.5 216.5V230L292 184.5V262C277.5 258 248 263.5 224.5 286C201.56 307.964 200.5 322 200.5 325.5V421.5L337 318C346.167 311.167 364.5 287.7 364.5 248.5V35H200.5Z"
										fill={"white"}
									/>
									<path
										fill-rule="evenodd"
										clip-rule="evenodd"
										d="M378 20.5H198.5H195H21V245.5C21 294.254 38.8206 312.851 48.2527 322.694L48.2567 322.698C48.6896 323.15 49.1049 323.583 49.5 324L200.5 438C223.333 420.333 279.2 377.3 320 346.5C366.5 314 374 293.5 378 267.5V20.5ZM200.5 99V35H364.5V248.5C364.5 287.7 346.167 311.167 337 318L200.5 421.5V325.5C200.5 322 201.56 307.964 224.5 286C248 263.5 277.5 258 292 262V184.5L200.5 230V216.5L324 157L200.5 99ZM200 217V100.5L76.5 158L200 217ZM106.5 261.5V187.5L200 232C200.5 265.167 201.1 330.3 199.5 325.5C197.5 319.5 189.065 299.333 164.5 278C145.5 261.5 118 259.5 106.5 261.5Z"
										fill="#0F161D"
									/>
								</svg>
								<div>
									<p className="mb-2 text-lg font-semibold">
										Make an impression in EDU-FI
									</p>
									<p className="text-muted-foreground">
										Back a new wave of Web3 learners while earning real yield.
										Your support fuels education and leaves a measurable impact
										on the decentralized future of finance.
									</p>
								</div>
								<Button variant="outline" className="mr-auto" asChild>
									<a href="#" target="_blank">
										Go to Investor Dashboard
									</a>
								</Button>
							</div>
							<div className="flex flex-col justify-between gap-6 rounded-xl bg-muted p-7 md:w-1/2 lg:w-auto">
								<img
									src={"/yieldedu.svg"}
									alt={"logo"}
									className="mr-auto h-12"
								/>
								<div>
									<p className="mb-2 text-lg font-semibold">
										Start Learning and Earning
									</p>
									<p className="text-muted-foreground">
										Access curated Web3 lessons, earn rewards for your progress,
										and build on-chain credentials that showcase your skills and
										knowledge.
									</p>
								</div>
								<Button disabled variant="outline" className="mr-auto">
									Explore Lessons
								</Button>
							</div>
						</div>
					</div>
					<MarqueSection />
					<Faq badge="" />
				</div>
			</section>
			<Footer />
		</>
	);
};

export default Page;
