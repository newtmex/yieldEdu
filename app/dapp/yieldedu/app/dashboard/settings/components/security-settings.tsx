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
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Copy, Loader2, Smartphone } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

export function SecuritySettings() {
	const [isLoading, setIsLoading] = useState(false);
	const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);

	// In a real app, this would be fetched from an API
	const [securityData, setSecurityData] = useState({
		twoFactorEnabled: false,
		sessionTimeout: 30,
		loginNotifications: true,
		recentActivity: [
			{
				id: 1,
				action: "Login",
				device: "Chrome on Windows",
				location: "New York, USA",
				time: "Today, 10:30 AM",
			},
			{
				id: 2,
				action: "Password Changed",
				device: "Chrome on Windows",
				location: "New York, USA",
				time: "Mar 15, 2025",
			},
			{
				id: 3,
				action: "Login",
				device: "Safari on iPhone",
				location: "Boston, USA",
				time: "Mar 10, 2025",
			},
		],
		recoveryCodes: [
			"ABCD-EFGH-IJKL-MNOP",
			"QRST-UVWX-YZ12-3456",
			"7890-ABCD-EFGH-IJKL",
			"MNOP-QRST-UVWX-YZ12",
			"3456-7890-ABCD-EFGH",
		],
	});

	const handleCopyCode = (code: string) => {
		navigator.clipboard.writeText(code);
		toast({
			title: "Copied",
			description: "Recovery code copied to clipboard",
			variant: "default",
		});
	};

	const handleSaveChanges = async () => {
		setIsLoading(true);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));
		setIsLoading(false);
		toast({
			title: "Settings saved",
			description: "Your security settings have been updated",
			variant: "default",
		});
	};

	const handle2FAToggle = (checked: boolean) => {
		if (checked) {
			// In a real app, this would open a 2FA setup flow
			toast({
				title: "2FA Initiated",
				description:
					"Follow the setup instructions to enable two-factor authentication.",
				variant: "default",
			});
		}
		setSecurityData({ ...securityData, twoFactorEnabled: checked });
	};

	return (
		<div className="space-y-6">
			<Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm">
				<CardHeader>
					<CardTitle>Two-Factor Authentication (2FA)</CardTitle>
					<CardDescription>
						Add an extra layer of security to your account
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between  border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm shadow-sm bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4 space-y-2">
						<div className="space-y-0.5">
							<div className="flex items-center">
								<Smartphone className="mr-2 h-4 w-4" />
								<span className="font-medium">Authenticator App</span>
							</div>
							<p className="text-sm text-muted-foreground">
								Use an authenticator app to generate one-time codes
							</p>
						</div>
						<Switch
							checked={securityData.twoFactorEnabled}
							onCheckedChange={handle2FAToggle}
						/>
					</div>

					{securityData.twoFactorEnabled && (
						<div>
							<Alert className="bg-amber-50 text-amber-800 dark:bg-amber-950/20 border-amber-400 dark:text-amber-300">
								<AlertCircle className="h-4 w-4 !text-amber-800 dark:!text-amber-400" />
								<AlertTitle>Important</AlertTitle>
								<AlertDescription>
									Save these recovery codes in a secure location. They can be
									used to recover your account if you lose access to your
									authenticator app.
								</AlertDescription>
							</Alert>

							<div className="mt-4">
								<Button
									variant="default"
									size="sm"
									className="relative cursor-pointer overflow-clip"
									onClick={() => setShowRecoveryCodes(!showRecoveryCodes)}
								>
									{showRecoveryCodes ? "Hide" : "Show"} Recovery Codes
								</Button>

								{showRecoveryCodes && (
									<div className="mt-4 space-y-2">
										<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
											{securityData.recoveryCodes.map((code, index) => (
												<div
													key={index}
													className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2 text-sm font-mono"
												>
													{code}
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleCopyCode(code)}
														className="h-6 w-6"
													>
														<Copy className="h-3.5 w-3.5" />
														<span className="sr-only">Copy code</span>
													</Button>
												</div>
											))}
										</div>
										<p className="text-xs text-muted-foreground">
											Keep these recovery codes safe. Each code can only be used
											once.
										</p>
									</div>
								)}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Session Settings</CardTitle>
					<CardDescription>
						Manage your active sessions and security preferences
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
						<Input
							id="session-timeout"
							type="number"
							min="5"
							max="120"
							value={securityData.sessionTimeout}
							onChange={(e) =>
								setSecurityData({
									...securityData,
									sessionTimeout: Number.parseInt(e.target.value),
								})
							}
						/>
						<p className="text-xs text-muted-foreground">
							Your session will expire after this period of inactivity
						</p>
					</div>

					<div className="flex items-center space-x-2">
						<Switch
							id="login-notifications"
							checked={securityData.loginNotifications}
							onCheckedChange={(checked) =>
								setSecurityData({
									...securityData,
									loginNotifications: checked,
								})
							}
						/>
						<Label htmlFor="login-notifications">
							Notify me about new logins to my account
						</Label>
					</div>
				</CardContent>
				<CardFooter>
					<Button onClick={handleSaveChanges} disabled={isLoading}>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Save Changes
					</Button>
				</CardFooter>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Recent Activity</CardTitle>
					<CardDescription>
						Review recent account activity and security events
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{securityData.recentActivity.map((activity) => (
							<div
								key={activity.id}
								className="flex justify-between border-b pb-4 last:border-0 last:pb-0"
							>
								<div>
									<p className="font-medium">{activity.action}</p>
									<p className="text-sm text-muted-foreground">
										{activity.device}
									</p>
									<p className="text-sm text-muted-foreground">
										{activity.location}
									</p>
								</div>
								<div className="text-right text-sm text-muted-foreground">
									{activity.time}
								</div>
							</div>
						))}
					</div>
				</CardContent>
				<CardFooter>
					<Button variant="outline" className="w-full">
						View Full Activity Log
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
