// components/CourseCard.tsx
import Image from "next/image";
import { Card, CardContent, CardFooter } from "./ui/card";
import { IconStarFilled } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "./ui/button";

type CourseCardProps = {
	title: string;
	description: string;
	imageUrl?: string;
	id: string;
};

export default function CourseCard({
	title,
	description,
	imageUrl = "/course-image.svg", // replace with your default
	id,
}: CourseCardProps) {
	return (
		<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
			<Card className="relative bg-card rounded-xl shadow-md flex items-center justify-between gap-4 w-full">
				<CardContent className="flex items-center justify-between w-full gap-3">
					<div className="flex-1">
						<h2 className="font-semibold text-sm md:text-md">{title}</h2>
						<p className="text-muted-foreground text-sm mt-2 ">
							{description}
							{/* {description.slice(0, 70)} */}
						</p>

						<Link href={`/courses/${id}`}>
							<Button className="mt-4 text-sm px-4 py-2 rounded">
								Enroll Now
							</Button>
						</Link>
					</div>
					<Image
						src={imageUrl}
						alt={title}
						width={150}
						height={150}
						className="object-contain invert-0 dark:invert"
					/>
				</CardContent>
				<div className="absolute bottom-2 left-5 flex items-center gap-1">
					<IconStarFilled className="!text-yellow-500 h-auto w-4" />
					4.9
				</div>
			</Card>
		</div>
	);
}
