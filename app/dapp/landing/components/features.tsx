import { ContainerScroll, CardSticky } from "@/components/card-stack";

const PROCESS_PHASES = [
	{
		id: "feature-1",
		title: "sTokens: Your Proof of Progress",
		description:
			"sTokens are ERC-1155 token that gives students access to gated lessons and serve as verifiable, on-chain credentials representing real ownership of knowledge earned.",
	},
	{
		id: "feature-2",
		title: "Funded Learning, Earned Rewards",
		description:
			"Education on YieldEdu is powered by capital. Students learn because someone believed in their future and progress is rewarded, not just graded.",
	},
	{
		id: "feature-3",
		title: "Adaptive Performance Analysis",
		description:
			"Every interaction is analyzed to identify strengths and weaknesses, enabling a tailored learning path that maximizes each learner’s potential.",
	},
	{
		id: "feature-4",
		title: "Investor Impact",
		description:
			"When investors fund education, they receive sTokens and each represents a learning capacity. These tokens are used by students to access content, tying investor support directly to real educational outcomes.",
	},
	{
		id: "feature-5",
		title: "Transparent Education Economy",
		description:
			"From staking to rewards, every flow of value is visible. YieldEdu is not just a platform it’s a decentralized education economy in motion.",
	},
];

const Features = () => {
	return (
		<div className="container min-h-svh py-4 place-content-center bg-stone-50 px-6 text-stone-900 xl:px-12">
			<div className="grid md:grid-cols-2 md:gap-8 xl:gap-12">
				<div className="left-0 top-0 md:sticky md:h-svh md:py-12">
					<h5 className=" text-xs uppercase tracking-wide">features</h5>
					<h2 className="mb-6 mt-4 text-4xl max-w-md font-bold tracking-tight">
						Why <span className="text-indigo-500">Learners Trust</span> and
						<span className="text-indigo-500">Thrive</span> on YieldEdu
					</h2>
					<p className="max-w-prose text-sm">
						YieldEdu is redefining education through tokenized access,
						performance-driven analytics, and transparent funding mechanics.
						Learners earn, investors track impact, and credentials are owned not
						just issued.
					</p>
				</div>
				<ContainerScroll className="min-h-[400vh] space-y-8 py-16">
					{PROCESS_PHASES.map((phase, index) => (
						<CardSticky
							key={phase.id}
							index={index + 2}
							className="rounded-2xl border p-8 shadow-md backdrop-blur-md"
						>
							<div className="flex items-center justify-between gap-4">
								<h2 className="my-6 text-2xl font-bold tracking-tighter">
									{phase.title}
								</h2>
								<h3 className="text-2xl font-bold text-indigo-500">
									{String(index + 1).padStart(2, "0")}
								</h3>
							</div>

							<p className="text-foreground">{phase.description}</p>
						</CardSticky>
					))}
				</ContainerScroll>
			</div>
		</div>
	);
};

export { Features };
