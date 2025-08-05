import React from "react";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import Link from "next/link";
import useCourseInfo from "@/hooks/course";
import { LoaderCircle } from "lucide-react";

type courseProgressProps = {
	id?: string;
	lesson: string;
	description: string;
	progress: number;
	title: string;
	itemsLeftText: string;
};
const ProgressCourse = ({
	id,
	lesson,
	description,
	progress,
	title,
	itemsLeftText,
}: courseProgressProps) => {
	const { isPending, course_completed } = useCourseInfo(id as string);

	return (
		<Card key={id} className="w-full flex-1 bg-sidebar">
			<CardContent>
				<div className="space-y-4">
					<div className="flex flex-col gap-4 sm:flex-row justify-between">
						<div className="">
							<h3 className="font-semibold text-md truncate text-ellipsis overflow-hidden whitespace-nowrap w-64">
								{title}
							</h3>
							<p className="text-sm truncate text-ellipsis overflow-hidden whitespace-nowrap w-64 text-black/50 dark:text-white/50">
								{lesson}
							</p>
							<p className="text-sm mt-2 truncate text-ellipsis overflow-hidden whitespace-nowrap w-64">
								{description.slice(0, 70)}
							</p>
						</div>
						<div className="text-right">
							<div className="text-sm whitespace-nowrap font-semibold text-lime-600">
								{progress}% Complete
							</div>
							<div className="text-xs text-yellow-500">{itemsLeftText}</div>
						</div>
					</div>
					<Progress value={progress} className="h-2" />

					{isPending ? (
						<Button disabled className="mt-4 text-sm px-4 py-2 rounded">
							Please wait...
							{isPending && <LoaderCircle className="animate-spin" size={16} />}
						</Button>
					) : course_completed ? (
						<Button
							disabled
							className=" w-full dark:bg-lime-600/30 dark:hover:bg-lime-600/20 dark:text-lime-400"
						>
							Course Completed
						</Button>
					) : (
						<Link href={`/courses/${id}/learning`}>
							<Button className=" w-full dark:bg-lime-600/30 dark:hover:bg-lime-600/20 dark:text-lime-400">
								Continue
							</Button>
						</Link>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default ProgressCourse;
