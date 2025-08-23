import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, DollarSign, User } from "lucide-react";

interface ReferralEntry {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	joinDate: string;
	status: "active" | "pending" | "inactive";
	earnings: number;
}

export const ReferralHistory = () => {
	const referrals: ReferralEntry[] = [
		{
			id: "1",
			name: "Alice Johnson",
			email: "alice@example.com",
			avatar: "/placeholder.svg",
			joinDate: "2024-01-15",
			status: "active",
			earnings: 50,
		},
		{
			id: "2",
			name: "Bob Smith",
			email: "bob@example.com",
			joinDate: "2024-01-12",
			status: "active",
			earnings: 50,
		},
		{
			id: "3",
			name: "Carol Davis",
			email: "carol@example.com",
			joinDate: "2024-01-10",
			status: "pending",
			earnings: 0,
		},
		{
			id: "4",
			name: "David Wilson",
			email: "david@example.com",
			joinDate: "2024-01-08",
			status: "active",
			earnings: 50,
		},
		{
			id: "5",
			name: "Emma Brown",
			email: "emma@example.com",
			joinDate: "2024-01-05",
			status: "active",
			earnings: 50,
		},
		{
			id: "6",
			name: "Frank Miller",
			email: "frank@example.com",
			joinDate: "2024-01-03",
			status: "inactive",
			earnings: 25,
		},
		{
			id: "7",
			name: "Grace Lee",
			email: "grace@example.com",
			joinDate: "2024-01-01",
			status: "active",
			earnings: 50,
		},
	];

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "bg-success/10 text-success hover:bg-success/20";
			case "pending":
				return "bg-warning/10 text-warning hover:bg-warning/20";
			case "inactive":
				return "bg-muted text-muted-foreground";
			default:
				return "bg-muted text-muted-foreground";
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	return (
		<Card className="shadow-blue">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<User className="h-5 w-5" />
					Referral History
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{referrals.map((referral) => (
						<div
							key={referral.id}
							className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/20 transition-colors animate-slide-up"
						>
							<div className="flex items-center gap-4">
								<Avatar className="h-10 w-10">
									<AvatarImage src={referral.avatar} alt={referral.name} />
									<AvatarFallback className="bg-gradient-primary text-primary-foreground">
										{referral.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>

								<div className="space-y-1">
									<div className="font-medium">{referral.name}</div>
									<div className="text-sm text-muted-foreground">
										{referral.email}
									</div>
								</div>
							</div>

							<div className="flex items-center gap-4 text-sm">
								<div className="flex items-center gap-1 text-muted-foreground">
									<CalendarDays className="h-4 w-4" />
									{formatDate(referral.joinDate)}
								</div>

								<Badge className={getStatusColor(referral.status)}>
									{referral.status}
								</Badge>

								<div className="flex items-center gap-1 font-medium text-success">
									<DollarSign className="h-4 w-4" />
									{referral.earnings}
								</div>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
};
