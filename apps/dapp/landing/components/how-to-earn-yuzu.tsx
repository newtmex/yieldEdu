import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Settings2, Sparkles, Zap } from "lucide-react";
import { ReactNode } from "react";
import yuzuLearn from "@/public/learn&earn.svg";
import fundEducation from "@/public/fund-education.svg";
import referral from "@/public/referrals.svg";

import Image from "next/image";

export function EarnYuzu() {
	return (
		<section className="bg-zinc-50 py-16 md:py-32 dark:bg-transparent">
			<div className="@container mx-auto max-w-5xl px-6">
				<div className="text-center">
					<h2 className="text-balance text-4xl font-semibold lg:text-5xl">
						How to earn Yuzu
					</h2>
					<p className="mt-4 text-primary/80">
						YUZU can only be <span className="font-bold">earned</span> or{" "}
						<span className="font-bold">burned</span> and is{" "}
						<span className="font-bold">non-transferable</span>.
					</p>
				</div>
				<div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto mt-8 grid max-w-md gap-6 *:text-center md:mt-16">
					<Card className="group grainy-raw shadow-black-950/5">
						<CardHeader className="pb-3">
							<Image
								alt="learn & earn"
								className="h-auto grayscale-100 transition duration-200 group-hover:grayscale-0 w-2xl"
								src={yuzuLearn}
							/>

							<h3 className="mt-6 font-bold text-xl">Learn & Earn</h3>
						</CardHeader>

						<CardContent>
							<p className="text-md">
								<span className="font-bold">Earn YUZU Points</span> by
								completing <span className="font-bold">lessons</span>,{" "}
								<span className="font-bold">quizzes</span>, and{" "}
								<span className="font-bold">challenges</span>.
							</p>
						</CardContent>
					</Card>

					<Card className="group grainy-raw shadow-black-950/5">
						<CardHeader className="pb-3">
							<Image
								alt="learn & earn"
								className="h-auto grayscale-100 transition duration-200 group-hover:grayscale-0 w-2xl"
								src={fundEducation}
							/>

							<h3 className="mt-6 font-bold text-xl">Fund Education</h3>
						</CardHeader>

						<CardContent>
							<p className="text-md">
								<span className="font-bold">Invest $EDU</span> to fund education
								and <span className="font-bold">earn YUZU Points</span> , while
								receiving back your{" "}
								<span className="font-bold">yields plus principal</span>
							</p>
						</CardContent>
					</Card>
					<Card className="group grainy-raw shadow-black-950/5">
						<CardHeader className="pb-3">
							<Image
								alt="learn & earn"
								className="h-auto grayscale-100 transition duration-200 group-hover:grayscale-0 w-2xl"
								src={referral}
							/>

							<h3 className="mt-6 font-bold text-xl">Referrals</h3>
						</CardHeader>

						<CardContent>
							<p className="text-md">
								<span className="font-bold">Invite friends</span> to YieldEdu
								and <span className="font-bold">earn YUZU Points</span> and
								<span className="font-bold"> bonuses</span> from their
								activities.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
}
