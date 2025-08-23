import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown, Trophy, Medal, Award } from "lucide-react";

interface LeaderboardEntry {
	rank: number;
	name: string;
	avatar?: string;
	referrals: number;
	earnings: number;
	isCurrentUser?: boolean;
}

const ReferralLeaderBoard = () => {
	const leaderboardData: LeaderboardEntry[] = [
		{
			rank: 1,
			name: "Sarah Chen",
			avatar: "/placeholder.svg",
			referrals: 47,
			earnings: 4700,
		},
		{
			rank: 2,
			name: "Michael Rodriguez",
			referrals: 43,
			earnings: 4300,
		},
		{
			rank: 3,
			name: "Jessica Wang",
			referrals: 38,
			earnings: 3800,
		},
		{
			rank: 4,
			name: "Alex Thompson",
			referrals: 35,
			earnings: 3500,
		},
		{
			rank: 5,
			name: "Emily Davis",
			referrals: 31,
			earnings: 3100,
		},
		{
			rank: 6,
			name: "Jordan Kim",
			referrals: 28,
			earnings: 2800,
		},
		{
			rank: 7,
			name: "Taylor Swift",
			referrals: 25,
			earnings: 2500,
		},
		{
			rank: 8,
			name: "Ryan Johnson",
			referrals: 22,
			earnings: 2200,
		},
		{
			rank: 9,
			name: "Lisa Park",
			referrals: 19,
			earnings: 1900,
		},
		{
			rank: 10,
			name: "Chris Brown",
			referrals: 16,
			earnings: 1600,
		},
		{
			rank: 11,
			name: "Amanda White",
			referrals: 13,
			earnings: 1300,
		},
		{
			rank: 12,
			name: "John Doe",
			referrals: 7,
			earnings: 2350,
			isCurrentUser: true,
		},
	];

	const getRankIcon = (rank: number) => {
		switch (rank) {
			case 1:
				return <Crown className="h-5 w-5 text-warning" />;
			case 2:
				return <Trophy className="h-5 w-5 text-muted-foreground" />;
			case 3:
				return <Medal className="h-5 w-5 text-amber-600" />;
			default:
				return <Award className="h-4 w-4 text-muted-foreground" />;
		}
	};

	const getRankColor = (rank: number) => {
		switch (rank) {
			case 1:
				return "bg-gradient-achievement text-warning-foreground shadow-gold";
			case 2:
				return "bg-muted/50 text-foreground";
			case 3:
				return "bg-amber-500/10 text-amber-600";
			default:
				return "";
		}
	};

	return (
		<Card className="shadow-purple">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Trophy className="h-5 w-5" />
					Leaderboard
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{leaderboardData.map((entry, index) => (
						<div
							key={entry.rank}
							className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 animate-slide-up ${
								entry.isCurrentUser
									? "border-primary bg-primary/5 shadow-purple"
									: entry.rank <= 3
										? `border-border/50 ${getRankColor(entry.rank)}`
										: "border-border/30 hover:border-border/50"
							}`}
							style={{ animationDelay: `${index * 50}ms` }}
						>
							<div className="flex items-center gap-4">
								<div className="flex items-center justify-center w-8 h-8">
									{entry.rank <= 3 ? (
										getRankIcon(entry.rank)
									) : (
										<span className="text-sm font-medium text-muted-foreground">
											#{entry.rank}
										</span>
									)}
								</div>

								<Avatar className="h-10 w-10">
									<AvatarImage src={entry.avatar} alt={entry.name} />
									<AvatarFallback className="bg-gradient-primary text-primary-foreground">
										{entry.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>

								<div className="space-y-1">
									<div className="font-medium flex items-center gap-2">
										{entry.name}
										{entry.isCurrentUser && (
											<Badge variant="secondary" className="text-xs">
												You
											</Badge>
										)}
									</div>
									<div className="text-sm text-muted-foreground">
										{entry.referrals} referrals
									</div>
								</div>
							</div>

							<div className="text-right">
								<div className="font-semibold text-success">
									${entry.earnings.toLocaleString()}
								</div>
								<div className="text-xs text-muted-foreground">
									Total earned
								</div>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
};

export default ReferralLeaderBoard;
