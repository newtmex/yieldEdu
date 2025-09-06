import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gift, Check, Lock } from "lucide-react";
import { toast } from "sonner";

interface Milestone {
	id: number;
	referrals: number;
	reward: string;
	completed: boolean;
	claimed: boolean;
}

interface MilestoneCardProps {
	milestone: Milestone;
	currentReferrals: number;
}

const MilestoneCard = ({ milestone, currentReferrals }: MilestoneCardProps) => {
	const progressPercentage = Math.min(
		(currentReferrals / milestone.referrals) * 100,
		100
	);
	const isUnlocked = currentReferrals >= milestone.referrals;
	const canClaim = isUnlocked && !milestone.claimed;

	const handleClaim = () => {
		if (canClaim) {
			toast.success(`Congratulations! You've claimed ${milestone.reward}!`);
		}
	};

	const getCardStyle = () => {
		if (milestone.claimed) {
			return "border-success/30 bg-gradient-success/5 shadow-gold";
		}
		if (isUnlocked) {
			return "border-warning/50 bg-gradient-achievement/10 shadow-gold animate-pulse-glow";
		}
		return "border-border/30 bg-card";
	};

	const getIconStyle = () => {
		if (milestone.claimed) {
			return "h-6 w-6 text-success";
		}
		if (isUnlocked) {
			return "h-6 w-6 text-warning";
		}
		return "h-6 w-6 text-muted-foreground";
	};

	return (
		<Card className={`transition-all duration-300 ${getCardStyle()}`}>
			<CardContent className="p-6">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-full bg-muted/50">
							{milestone.claimed ? (
								<Check className={getIconStyle()} />
							) : isUnlocked ? (
								<Gift className={getIconStyle()} />
							) : (
								<Lock className={getIconStyle()} />
							)}
						</div>
						<div>
							<h3 className="font-semibold text-lg">
								{milestone.referrals} Referrals
							</h3>
							<p className="text-sm text-muted-foreground">
								Milestone {milestone.id}
							</p>
						</div>
					</div>

					<div className="text-right">
						<div className="text-2xl font-bold text-warning">
							{milestone.reward}
						</div>
						<Badge
							variant={
								milestone.claimed
									? "secondary"
									: isUnlocked
										? "default"
										: "outline"
							}
							className={
								milestone.claimed
									? "bg-success/10 text-success"
									: isUnlocked
										? "bg-warning/10 text-warning"
										: ""
							}
						>
							{milestone.claimed ? "Claimed" : isUnlocked ? "Ready" : "Locked"}
						</Badge>
					</div>
				</div>

				<div className="space-y-3">
					<div className="flex items-center justify-between text-sm">
						<span>Progress</span>
						<span className="font-medium">
							{Math.min(currentReferrals, milestone.referrals)}/
							{milestone.referrals}
						</span>
					</div>

					<Progress
						value={progressPercentage}
						className={`h-2 ${isUnlocked ? "animate-progress-fill" : ""}`}
					/>

					{canClaim && (
						<Button
							onClick={handleClaim}
							className="w-full bg-gradient-achievement hover:opacity-90 shadow-gold"
						>
							<Gift className="h-4 w-4 mr-2" />
							Claim Reward
						</Button>
					)}

					{!isUnlocked && (
						<p className="text-sm text-muted-foreground text-center">
							{milestone.referrals - currentReferrals} more referrals needed
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default MilestoneCard;
