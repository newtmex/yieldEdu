import React from "react";
import VIPHuman from "@/public/being-vip.svg";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import featuredCourseImage from "@/public/featured-course.svg";
import CourseCard from "@/components/course-card";

const page = () => {
	const courses = [
		{
			title: "Tokenomics By Gainzswaps",
			reward: "200 YUZU",
			description:
				"Learn the basics of decentralized finance and how it's revolutionizing traditional banking.",
			imageUrl: featuredCourseImage, // Place in /public
			id: "dkjsfk",
		},
		{
			title: "Intro to DAOs",
			reward: "150 YUZU",
			description: "Understand how decentralized organizations operate.",
			imageUrl: featuredCourseImage,
			id: "dkjsfk",
		},
		{
			title: "Intro to DAOs",
			reward: "150 YUZU",
			description: "Understand how decentralized organizations operate.",
			imageUrl: featuredCourseImage,
			id: "dkjsfk",
		},
		{
			title: "Intro to DAOs",
			reward: "150 YUZU",
			description: "Understand how decentralized organizations operate.",
			imageUrl: featuredCourseImage,
			id: "dkjsfk",
		},
		{
			title: "Intro to DAOs",
			reward: "150 YUZU",
			description: "Understand how decentralized organizations operate.",
			imageUrl: featuredCourseImage,
			id: "dkjsfk",
		},
	];

	return (
		<div className="space-y-4 p-5">
			<div className="flex flex-col md:flex-row max-w-4xl mx-auto justify-center items-center gap-4 ">
				<div className="flex-[1.5] w-full">
					<h1 className="text-xl md:text-3xl lg:text-5xl mb-2 font-bold">
						Learn and Earn at Your Own Pace
					</h1>
					<p className="text-muted-foreground text-[14px]">
						Explore bite-sized lessons designed to build your knowledge and
						momentum. As you complete activities, you’ll earn YUZU points, grow
						your learning streak, and unlock new opportunities on your journey.
					</p>
				</div>
				<div className="flex-1 hidden md:flex w-full">
					<Image
						alt="being vip"
						className="h-auto w-full invert-0 dark:invert"
						src={VIPHuman}
					/>
				</div>
			</div>
			<Separator />
			<div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-4">
				{courses.map((course) => (
					<CourseCard key={course.id} {...course} />
				))}
			</div>
		</div>
	);
};

export default page;
