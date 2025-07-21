import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import Image, { StaticImageData } from "next/image";

type PromoCardProps = {
	title: string;
	description: string;
	buttonLabel: string;
	onClick?: () => void;
	backgroundColor?: string;
	textColor?: string;
	image?: string | StaticImageData;
	isDark?: boolean;
	tag?: string;
};

const ActiveCampaign: React.FC<PromoCardProps> = ({
	title,
	description,
	buttonLabel,
	onClick,
	backgroundColor = "#fff",
	textColor = "#000",
	image,
	isDark = false,
	tag,
}) => {
	return (
		<Card style={{ backgroundColor, color: textColor }} className="h-full">
			<CardContent>
				<div className="grid h-[140px] grid-cols-1 [@media(min-width:425px)]:grid-cols-2">
					<div>
						{tag && (
							<p className="text-[10px] font-medium mb-1 opacity-80">{tag}</p>
						)}

						<h2 className="text-sm font-semibold mb-2">{title}</h2>
						<p className="text-xs mb-2  opacity-90">{description}</p>
					</div>
					{image && (
						<Image
							className="hidden [@media(min-width:425px)]:grid h-auto w-full"
							src={image}
							alt={title}
						/>
					)}
				</div>
				<Button
					variant={"secondary"}
					onClick={onClick}
					className={` cursor-pointer rounded-md text-sm font-medium ${
						isDark
							? "bg-yellow-400 hover:bg-yellow-500 text-black"
							: "!bg-white text-black"
					}`}
				>
					{buttonLabel}
				</Button>
			</CardContent>
		</Card>
	);
};

export default ActiveCampaign;
