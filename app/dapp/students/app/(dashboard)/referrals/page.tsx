"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Users, Trophy, Gift, Share2, Crown } from "lucide-react";
import { toast } from "sonner";
import { ReferralHistory } from "./components/ReferralHistory";
import ReferralLeaderBoard from "./components/ReferralLeaderBoard";
import MilestoneCard from "./components/MileStoneCard";
import Image from "next/image";

const Page = () => {
	const [currentReferrals] = useState(7);
	const [totalEarnings] = useState(2350);
	const [referralLink] = useState("https://app.example.com/ref/john123");

	const copyReferralLink = () => {
		navigator.clipboard.writeText(referralLink);
		toast.success("Referral link copied to clipboard!");
	};

	const milestones = [
		{ id: 1, referrals: 5, reward: "$100", completed: true, claimed: true },
		{ id: 2, referrals: 10, reward: "$250", completed: false, claimed: false },
		{ id: 3, referrals: 25, reward: "$750", completed: false, claimed: false },
		{ id: 4, referrals: 50, reward: "$2000", completed: false, claimed: false },
		{
			id: 5,
			referrals: 100,
			reward: "$5000",
			completed: false,
			claimed: false,
		},
	];

	const nextMilestone = milestones.find((m) => !m.completed);
	const progressToNext = nextMilestone
		? (currentReferrals / nextMilestone.referrals) * 100
		: 100;

	return (
		<div className="min-h-screen bg-background p-6">
			<div className="max-w-7xl mx-auto space-y-8">
				{/* <Image alt="referral" src={''}/> */}
				{/* Header */}
				<div className="text-center space-y-4">
					<h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
						Referral Program
					</h1>
					<p className="text-muted-foreground text-lg">
						Invite friends and earn rewards together
					</p>
				</div>

				{/* Main Stats */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Card className="border-primary/20 bg-gradient-primary/5 shadow-purple">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Referrals
							</CardTitle>
							<Users className="h-4 w-4 text-primary" />
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-primary">
								{currentReferrals}
							</div>
							<p className="text-xs text-muted-foreground">+2 from last week</p>
						</CardContent>
					</Card>

					<Card className="border-success/20 bg-gradient-success/5 shadow-gold">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Earnings
							</CardTitle>
							<Gift className="h-4 w-4 text-success" />
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-success">
								${totalEarnings}
							</div>
							<p className="text-xs text-muted-foreground">+$350 this month</p>
						</CardContent>
					</Card>

					<Card className="border-warning/20 bg-gradient-achievement/5 shadow-gold">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Current Rank
							</CardTitle>
							<Crown className="h-4 w-4 text-warning" />
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-warning">#12</div>
							<p className="text-xs text-muted-foreground">3 spots higher</p>
						</CardContent>
					</Card>
				</div>

				{/* Referral Link */}
				<Card className="shadow-blue">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Share2 className="h-5 w-5" />
							Your Referral Link
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex gap-3">
							<div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm">
								{referralLink}
							</div>
							<Button
								onClick={copyReferralLink}
								className="bg-gradient-primary hover:opacity-90"
							>
								<Copy className="h-4 w-4 mr-2" />
								Copy
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Progress to Next Milestone */}
				{nextMilestone && (
					<Card className="shadow-purple">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Trophy className="h-5 w-5" />
								Next Milestone
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<span>Progress to {nextMilestone.referrals} referrals</span>
								<Badge variant="secondary">
									{currentReferrals}/{nextMilestone.referrals}
								</Badge>
							</div>
							<Progress value={progressToNext} className="h-3" />
							<div className="text-sm text-muted-foreground">
								{nextMilestone.referrals - currentReferrals} more referrals to
								earn {nextMilestone.reward}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Tabs */}
				<Tabs defaultValue="milestones" className="space-y-6">
					<TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
						<TabsTrigger value="milestones">Milestones</TabsTrigger>
						<TabsTrigger value="history">History</TabsTrigger>
						<TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
					</TabsList>

					<TabsContent value="milestones" className="space-y-6">
						<div className="grid gap-4">
							{milestones.map((milestone) => (
								<MilestoneCard
									key={milestone.id}
									milestone={milestone}
									currentReferrals={currentReferrals}
								/>
							))}
						</div>
					</TabsContent>

					<TabsContent value="history">
						<ReferralHistory />
					</TabsContent>

					<TabsContent value="leaderboard">
						<ReferralLeaderBoard />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
};

export default Page;
