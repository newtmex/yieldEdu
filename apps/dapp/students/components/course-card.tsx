import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { IconStarFilled } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "./ui/button";
import featuredCourseImage from "@/public/featured-course.svg";
import { Badge } from "./ui/badge";
import { LoaderCircle } from "lucide-react";
import useCourseInfo from "@/hooks/course";
import { TooltipInfo } from "./tooltip-info";
import { formatNumber } from "@/helpers";

type CourseCardProps = {
	title: string;
	description: string;
	image_url?: string;
	id?: string;
	difficulty?: string;
	Category?: string;
	rating?: { userId: string; rating: number }[];
};

export default function CourseCard({
	title,
	description,
	image_url = featuredCourseImage,
	id,
	difficulty,
	Category,
	rating,
}: CourseCardProps) {
	const { isPending, course_completed } = useCourseInfo(id as string);

	const averageRating = rating?.length
		? (
				rating.reduce((sum: number, r) => sum + r.rating, 0) / rating.length
			).toFixed(1)
		: "0";

	return (
		<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
			<Card className="relative bg-card rounded-xl shadow-md flex items-center justify-between gap-4 w-full">
				<CardContent className="flex items-center justify-between w-full gap-3">
					<div className="flex-1 space-y-2">
						<div className="flex items-center gap-4 text-sm text-muted-foreground">
							{difficulty && <Badge variant="secondary">{difficulty}</Badge>}
							{Category && <span>{Category}</span>}
						</div>
						<h2 className="font-semibold text-sm md:text-md">{title}</h2>
						<p className="text-muted-foreground text-sm">
							{description}
							{/* {description.slice(0, 70)} */}
						</p>

						{isPending ? (
							<Button disabled className="mt-4 text-sm px-4 py-2 rounded">
								Please wait...
								{isPending && (
									<LoaderCircle className="animate-spin" size={16} />
								)}
							</Button>
						) : course_completed ? (
							<div className="flex flex-wrap sm:flex-nowrap">
								<Button disabled className="mt-4 text-sm px-4 py-2 rounded">
									Course Completed
								</Button>
								<Link href={`/courses/${id}`}>
									<Button
										variant={"link"}
										className="mt-4 text-xs px-4 underline hover:text-white/70 py-2 rounded"
									>
										Course details
									</Button>
								</Link>
							</div>
						) : course_completed === undefined ? (
							<Link href={`/courses/${id}`}>
								<Button className="mt-4 text-sm px-4 py-2 rounded">
									Enroll Now
								</Button>
							</Link>
						) : (
							<div className="flex flex-wrap sm:flex-nowrap">
								<Link href={`/courses/${id}/learning`}>
									<Button className="mt-4 text-sm px-4 py-2 rounded">
										Continue course
									</Button>
								</Link>
								<Link href={`/courses/${id}`}>
									<Button
										variant={"link"}
										className="mt-4 text-xs px-4 underline hover:text-white/70 py-2 rounded"
									>
										Course details
									</Button>
								</Link>
							</div>
						)}
					</div>
					<Image
						src={image_url}
						alt={title}
						width={150}
						height={150}
						className="object-contain hidden [@media(min-width:425px)]:flex invert-0 dark:invert"
					/>
				</CardContent>
				{parseFloat(averageRating) > 0 && (
					<div className="absolute bottom-3 w-fit text-xs right-5 ">
						<TooltipInfo
							showHelp={false}
							className="flex items-center gap-1"
							content={`Average rating from ${formatNumber(rating?.length || 0)} user(s)`}
						>
							<IconStarFilled className="!text-yellow-500 h-auto w-3" />
							{averageRating}
						</TooltipInfo>
					</div>
				)}
			</Card>
		</div>
	);
}
