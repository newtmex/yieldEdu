import { Badge } from "@/components/ui/badge";

export interface FaqItem {
	question: string;
	answer: string;
}

export interface Faq5Props {
	badge?: string;
	heading?: string;
	description?: string;
	faqs?: FaqItem[];
}

const defaultFaqs: FaqItem[] = [
	{
		question: "How does YieldEDU generate yields?",
		answer:
			"YieldEDU earns yields by integrating with DeFi protocols like GainzSwap and decentralized exchanges (DEXs). When investors fund learning, their contributions are deployed into these strategies to generate real, on-chain returns. A portion of the yield is used to reward learners, while investors earn from the performance—creating a win-win for both sides.",
	},
	{
		question: "What are sTokens and why are they important?",
		answer:
			"sTokens are on-chain credentials—ERC-1155 tokens that represent verified progress. When a learner completes gated lessons, they receive sTokens as proof. These tokens are valuable because they show real, verified ownership of educational outcomes.",
	},
	{
		question: "What makes YieldEDU a sustainable investment model?",
		answer:
			" YieldEDU doesn’t rely on token inflation to reward users. Instead, investor funds are deployed into yield-generating DeFi protocols. Returns from these investments fuel rewards for learners and create measurable educational outcomes—making it both impactful and sustainable.",
	},
	{
		question: "How does YieldEDU plan to keep learners engaged?",
		answer:
			"We believe people stay where value is created. YieldEDU combines real rewards, gamified learning (quizzes, sTokens), and community-driven features like streaks and leaderboards—turning education into a habit with tangible value.",
	},
];

export const Faq = ({
	badge = "FAQ",
	heading = "Common Questions & Answers",
	description = "Find out all the essential details about our platform and how it can serve your needs.",
	faqs = defaultFaqs,
}: Faq5Props) => {
	return (
		<section className="px-8 md:px-16">
			<div className="container">
				<div className="text-center">
					{badge && <Badge className="text-xs font-medium">{badge}</Badge>}
					<h1 className="mt-4 text-4xl font-semibold">{heading}</h1>
					<p className="mt-6 font-medium text-muted-foreground">
						{description}
					</p>
				</div>
				<div className="mx-auto mt-14 max-w-screen-sm">
					{faqs.map((faq, index) => (
						<div key={index} className="mb-8 flex gap-4">
							<span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-secondary font-mono text-xs text-primary">
								{index + 1}
							</span>
							<div>
								<div className="mb-2 flex items-center justify-between">
									<h3 className="font-medium">{faq.question}</h3>
								</div>
								<p className="text-sm text-muted-foreground">{faq.answer}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};
