import React from "react";
import { Button } from "./ui/button";
import { IconBrandTelegram, IconBrandX } from "@tabler/icons-react";

const CommunityCTA = () => {
	return (
		<div className="w-full">
			<div className="container mx-auto">
				<div className="flex flex-col text-center bg-muted rounded-md p-4 lg:p-14 gap-8 items-center">
					<div className="flex flex-col gap-2">
						<h3 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-regular">
							Join our Community
						</h3>
						<p className="text-lg leading-relaxed tracking-tight text-muted-foreground max-w-xl">
							Be part of the YieldEDU movement. Connect with others on Telegram,
							stay in the loop on Twitter, and help shape the future of
							DeFi-powered education.
						</p>
					</div>
					<div className="flex flex-row gap-4">
						<Button className="gap-4" variant="outline">
							Join Telegram <IconBrandTelegram className="w-4 h-4" />
						</Button>
						<Button className="gap-4">
							Follow Us <IconBrandX className="w-4 h-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CommunityCTA;
