"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

export function AccountSettings() {
	const [isLoading, setIsLoading] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	// In a real app, this would be fetched from an API
	const [accountData] = useState({
		walletAddress: "0x1234...5678",
		level: 2,
		memberSince: "March 2023",
		rewardPoints: 850,
	});

	const handleUpdateEmail = async () => {
		setIsLoading(true);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));

		setIsLoading(false);
		toast({
			title: "Email updated",
			description: "Verification email has been sent to your new address.",
			variant: "default",
		});
	};

	const handleDeleteAccount = async () => {
		setIsLoading(true);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1500));

		setIsLoading(false);
		setDeleteDialogOpen(false);
		toast({
			title: "Account deleted",
			description:
				"Your account has been scheduled for deletion. You will receive a confirmation email.",
			variant: "default",
		});
	};

	return (
		<div className="space-y-6">
			<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm">
				<CardHeader>
					<CardTitle>Wallet Connection</CardTitle>
					<CardDescription>Manage your connected wallet</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between  border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4 space-y-2">
						<div className="space-y-1">
							<p className="text-sm font-medium">Connected Wallet</p>
							<div className="flex items-center gap-2">
								<p className="text-sm text-muted-foreground">
									{accountData.walletAddress}
								</p>
								<Badge variant="outline" className="text-xs">
									Primary
								</Badge>
							</div>
						</div>
						<Button
							variant="default"
							size="sm"
							className="relative cursor-pointer overflow-clip"
						>
							Disconnect
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm">
				<CardHeader>
					<CardTitle>Account Information</CardTitle>
					<CardDescription>
						View your account details and membership status
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2   border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4">
						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">Account Level</p>
							<p className="font-medium">Level {accountData.level} Scholar</p>
						</div>
						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">Member Since</p>
							<p className="font-medium">{accountData.memberSince}</p>
						</div>
						<div className="space-y-1">
							<p className="text-sm text-muted-foreground">Reward Points</p>
							<p className="font-medium">{accountData.rewardPoints} XP</p>
						</div>
					</div>

					{/* <div className="rounded-lg bg-primary/5 p-4">
						<div className="flex justify-between">
							<div>
								<h4 className="font-medium">Upgrade to Premium</h4>
								<p className="text-sm text-muted-foreground">
									Get access to advanced lessons and higher staking limits
								</p>
							</div>
							<Button size="sm" className="h-8">
								Upgrade
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</div> */}
				</CardContent>
			</Card>

			<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm">
				<CardHeader>
					<CardTitle>Email Settings</CardTitle>
					<CardDescription>Update your email address</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="current-email">Current Email</Label>
						<Input
							id="current-email"
							value="alex@example.com"
							disabled
							className="bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:!ring-slate-500 dark:focus:!ring-lime-500 focus:!border-transparent focus:ring-offset-2 dark:ring-offset-lime-700 ring-offset-slate-700"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="new-email">New Email</Label>
						<Input
							id="new-email"
							type="email"
							placeholder="Enter your new email"
							className="bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:!ring-slate-500 dark:focus:!ring-lime-500 focus:!border-transparent focus:ring-offset-2 dark:ring-offset-lime-700 ring-offset-slate-700"
						/>
					</div>
				</CardContent>
				<CardFooter>
					<Button onClick={handleUpdateEmail} disabled={isLoading}>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Update Email
					</Button>
				</CardFooter>
			</Card>

			<Card className="bg-white bg-destructive/20 dark:bg-destructive/50 border border-destructive backdrop-blur-sm shadow-sm">
				<CardHeader>
					<CardTitle className="text-red-500">Danger Zone</CardTitle>
					<CardDescription className="text-red-500">
						Permanent actions that cannot be undone
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Alert variant="destructive" className="text-red-500">
						<AlertCircle className="h-4 w-4 !text-red-500" />
						<AlertTitle>Warning</AlertTitle>
						<AlertDescription>
							Deleting your account will remove all of your data and cannot be
							reversed. Make sure to withdraw any funds from staking pools
							before deleting your account.
						</AlertDescription>
					</Alert>
				</CardContent>
				<CardFooter>
					<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
						<DialogTrigger asChild>
							<Button variant="destructive">
								<Trash2 className="mr-2 h-4 w-4" />
								Delete Account
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Delete Account</DialogTitle>
								<DialogDescription>
									This action cannot be undone. This will permanently delete
									your account and remove your data including your points and
									progress.
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<p className="text-sm text-muted-foreground">
									Please type{" "}
									<span className="font-medium text-red-500">
										delete my account
									</span>{" "}
									to confirm deletion:
								</p>
								<Input placeholder="delete my account" />
							</div>
							<DialogFooter>
								<Button
									variant="outline"
									className="text-foreground"
									onClick={() => setDeleteDialogOpen(false)}
								>
									Cancel
								</Button>
								<Button
									variant="destructive"
									onClick={handleDeleteAccount}
									disabled={isLoading}
								>
									{isLoading && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									Delete Account
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</CardFooter>
			</Card>
		</div>
	);
}
