import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ProfileSettings } from "./components/profile-settings";
// import { SecuritySettings } from "./components/security-settings";
import { AccountSettings } from "./components/account-settings";
import { AppearanceSettings } from "./components/appearance-settings";
import { yieldEduMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import { Lock } from "lucide-react";

export const metadata: Metadata = {
	...yieldEduMetadata,
	title: "YieldEdu - Settings",
};

export default function SettingsPage() {
	return (
		<div className="container mx-auto md:max-w-4xl py-8">
			<div className="flex flex-col gap-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
					<p className="text-muted-foreground">
						Manage your account settings and preferences
					</p>
				</div>

				<Separator />

				<Tabs defaultValue="appearance" className="w-full">
					<TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-auto">
						<TabsTrigger disabled value="profile" className="flex gap-2">
							Profile <Lock size={15} />
						</TabsTrigger>
						<TabsTrigger disabled value="account" className="flex gap-2">
							Account <Lock size={15} />
						</TabsTrigger>
						{/* <TabsTrigger value="security">Security</TabsTrigger> */}
						<TabsTrigger value="appearance">Appearance</TabsTrigger>
					</TabsList>

					<TabsContent value="profile" className="mt-6">
						<ProfileSettings />
					</TabsContent>

					<TabsContent value="account" className="mt-6">
						<AccountSettings />
					</TabsContent>

					{/* <TabsContent value="security" className="mt-6">
						<SecuritySettings />
					</TabsContent> */}

					<TabsContent value="appearance" className="mt-6">
						<AppearanceSettings />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
