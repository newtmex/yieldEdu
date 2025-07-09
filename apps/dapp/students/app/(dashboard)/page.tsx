"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { useState, useEffect } from "react";
import type { Swiper as SwiperType } from "swiper";
import ActiveCampaign from "@/components/active-campaigns";
import chestImage from "@/public/chest.svg";
import masteryImage from "@/public/masteryImage.svg";
import { Navigation, A11y, Autoplay } from "swiper/modules";
import { IconChevronRight, IconChevronLeft } from "@tabler/icons-react";
import featuredCourseImage from "@/public/featured-course.svg";
// import { useOCAuth } from "@opencampus/ocid-connect-js";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import CourseCard from "@/components/course-card";
import { useSidebar } from "@/components/ui/sidebar";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const SwiperNavButtons = ({ swiper }: { swiper: SwiperType | null }) => {
	const [isBeginning, setIsBeginning] = useState(true);
	const [isEnd, setIsEnd] = useState(false);

	useEffect(() => {
		if (!swiper) return;

		const onSlideChange = () => {
			setIsBeginning(swiper.isBeginning);
			setIsEnd(swiper.isEnd);
		};

		onSlideChange(); // Set initial state

		swiper.on("slideChange", onSlideChange);

		return () => {
			swiper.off("slideChange", onSlideChange);
		};
	}, [swiper]);

	return (
		<div className="absolute inset-0 right-5 left-5">
			{!isBeginning && (
				<button
					onClick={() => swiper?.slidePrev()}
					className="absolute top-1/2 left-[-15px] transform -translate-y-1/2 z-10 cursor-pointer bg-gray-100/50 dark:bg-black/50 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center"
				>
					<IconChevronLeft size={20} />
				</button>
			)}
			{!isEnd && (
				<button
					onClick={() => swiper?.slideNext()}
					className="absolute top-1/2 right-[-15px] transform -translate-y-1/2 z-10 cursor-pointer bg-gray-100/50 dark:bg-black/50 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center"
				>
					<IconChevronRight size={20} />
				</button>
			)}
		</div>
	);
};

export default function Page() {
	// const { isInitialized, authState, ocAuth, OCId, ethAddress } = useOCAuth();
	const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
	const [swiperInstance2, setSwiperInstance2] = useState<SwiperType | null>(
		null
	);
	const { open } = useSidebar();

	const campaigns = [
		{
			title: "Unlock Your Learning Potential",
			description:
				"Discover Web3-powered lessons and track your learning streaks. Use YUZU points to boost your growth and unlock rewards.",
			buttonLabel: "Start Learning",
			backgroundColor: "#C4FF00",
			textColor: "#000",
			image: chestImage, // replace with actual icon component
			isDark: false,
		},
		{
			tag: "Upcoming Events",
			title: "Weekly Challenge: Smart Contract Mastery",
			description:
				"Earn YUZU points by completing this week's timed coding challenge.",
			timeInfo: "Live: Thursday, 4:00PM GMT",
			buttonLabel: "View Details",
			backgroundColor: "#000000",
			textColor: "#ffffff",
			image: masteryImage, // replace with actual icon component
			isDark: true,
		},
		{
			title: "Unlock Your Learning Potential",
			description:
				"Discover Web3-powered lessons and track your learning streaks. Use YUZU points to boost your growth and unlock rewards.",
			buttonLabel: "Start Learning",
			backgroundColor: "#C4FF00",
			textColor: "#000",
			image: chestImage, // replace with actual icon component
			isDark: false,
		},
		{
			tag: "Upcoming Events",
			title: "Weekly Challenge: Smart Contract Mastery",
			description:
				"Earn YUZU points by completing this week's timed coding challenge.",
			timeInfo: "Live: Thursday, 4:00PM GMT",
			buttonLabel: "Start Learning",
			backgroundColor: "#000000",
			textColor: "#ffffff",
			image: masteryImage, // replace with actual icon component
			isDark: true,
		},
	];

	const courses = [
		{
			title: "Tokenomics By Gainzswaps",
			reward: "200 YUZU",
			description:
				"Learn the basics of decentralized finance and how it's revolutionizing traditional banking.",
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

	const courseInProgress = [
		{
			title: "DeFi Fundamentals",
			lesson: "Lesson 4: Yield Farming Strategies",
			description:
				"Learn the basics of decentralized finance and how it's revolutionizing traditional banking.",
			progress: "75% Complete",
			lessonsLeft: 3,
		},
		{
			title: "DeFi Fundamentals",
			lesson: "Lesson 4: Yield Farming Strategies",
			description:
				"Learn the basics of decentralized finance and how it's revolutionizing traditional banking.",
			progress: "75% Complete",
			lessonsLeft: 3,
		},
		{
			title: "DeFi Fundamentals",
			lesson: "Lesson 4: Yield Farming Strategies",
			description:
				"Learn the basics of decentralized finance and how it's revolutionizing traditional banking.",
			progress: "75% Complete",
			lessonsLeft: 3,
		},
		{
			title: "DeFi Fundamentals",
			lesson: "Lesson 4: Yield Farming Strategies",
			description:
				"Learn the basics of decentralized finance and how it's revolutionizing traditional banking.",
			progress: "75% Complete",
			lessonsLeft: 3,
		},
		{
			title: "DeFi Fundamentals",
			lesson: "Lesson 4: Yield Farming Strategies",
			description:
				"Learn the basics of decentralized finance and how it's revolutionizing traditional banking.",
			progress: "75% Complete",
			lessonsLeft: 3,
		},
		{
			title: "DeFi Fundamentals",
			lesson: "Lesson 4: Yield Farming Strategies",
			description:
				"Learn the basics of decentralized finance and how it's revolutionizing traditional banking.",
			progress: "75% Complete",
			lessonsLeft: 3,
		},
		{
			title: "DeFi Fundamentals",
			lesson: "Lesson 4: Yield Farming Strategies",
			description:
				"Learn the basics of decentralized finance and how it's revolutionizing traditional banking.",
			progress: "75% Complete",
			lessonsLeft: 3,
		},
		{
			title: "DeFi Fundamentals",
			lesson: "Lesson 4: Yield Farming Strategies",
			description:
				"Learn the basics of decentralized finance and how it's revolutionizing traditional banking.",
			progress: "75% Complete",
			lessonsLeft: 3,
		},
		{
			title: "DeFi Fundamentals",
			lesson: "Lesson 4: Yield Farming Strategies",
			description:
				"Learn the basics of decentralized finance and how it's revolutionizing traditional banking.",
			progress: "75% Complete",
			lessonsLeft: 3,
		},
		{
			title: "DeFi Fundamentals",
			lesson: "Lesson 4: Yield Farming Strategies",
			description:
				"Learn the basics of decentralized finance and how it's revolutionizing traditional banking.",
			progress: "75% Complete",
			lessonsLeft: 3,
		},
		{
			title: "DeFi Fundamentals",
			lesson: "Lesson 4: Yield Farming Strategies",
			description:
				"Learn the basics of decentralized finance and how it's revolutionizing traditional banking.",
			progress: "75% Complete",
			lessonsLeft: 3,
		},
	];
	return (
		<div className="space-y-4">
			<div className="relative py-5 pl-5">
				<Swiper
					key={open ? "sidebar-open" : "sidebar-closed"}
					className="w-full"
					modules={[Navigation, A11y, Autoplay]}
					spaceBetween={16}
					slidesPerView={1}
					pagination={{ clickable: true }}
					onSwiper={setSwiperInstance}
					loop={true}
					autoplay={{
						delay: 7000,
						disableOnInteraction: false,
					}}
					breakpoints={{
						500: {
							slidesPerView: 1,
						},
						600: {
							slidesPerView: 1.3,
						},
						768: {
							slidesPerView: open ? 1 : 1.5,
						},

						900: {
							slidesPerView: open ? 1.3 : 1.5,
						},
						1000: {
							slidesPerView: open ? 1.5 : 2,
						},
						1100: {
							slidesPerView: open ? 2.1 : 2.5,
						},
					}}
				>
					{campaigns.map(
						({
							tag,
							title,
							description,
							buttonLabel,
							backgroundColor,
							textColor,
							isDark,
							image,
						}) => {
							return (
								<SwiperSlide key={title}>
									<ActiveCampaign
										tag={tag}
										title={title}
										description={description}
										buttonLabel={buttonLabel}
										backgroundColor={backgroundColor}
										textColor={textColor}
										image={image}
										isDark={isDark}
									/>
								</SwiperSlide>
							);
						}
					)}
				</Swiper>
				<SwiperNavButtons swiper={swiperInstance} />
			</div>
			<div className="px-5 pb-5">
				<div className="flex items-center justify-between">
					<h2 className="font-semibold">Featured Courses</h2>
					<Button variant={"secondary"}>Explore More</Button>
				</div>
				<div className="relative mt-4">
					<Swiper
						key={open ? "sidebar-open" : "sidebar-closed"}
						modules={[Navigation, A11y, Autoplay]}
						spaceBetween={16}
						slidesPerView={1}
						onSwiper={setSwiperInstance2}
						loop={true}
						breakpoints={{
							500: {
								slidesPerView: 1,
							},
							600: {
								slidesPerView: 1.3,
							},
							700: {
								slidesPerView: 1.6,
							},
							768: {
								slidesPerView: open ? 1 : 1.5,
							},
							900: {
								slidesPerView: open ? 1.3 : 1.5,
							},
							1000: {
								slidesPerView: open ? 1.5 : 2,
							},
							1100: {
								slidesPerView: open ? 1.8 : 2.3,
							},
							1200: {
								slidesPerView: open ? 2 : 2.3,
							},
						}}
						className="flex gap-4"
					>
						{courses.map((course) => (
							<SwiperSlide key={course.id} className="py-1">
								<CourseCard {...course} />
							</SwiperSlide>
						))}
					</Swiper>
					<SwiperNavButtons swiper={swiperInstance2} />
				</div>
			</div>
			<div className="p-5 *:data-[slot=card]:from-lime-400/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card  *:data-[slot=card]:bg-gradient-to-t">
				<Card>
					<CardHeader>
						<CardTitle>Continue Learning</CardTitle>
						<CardDescription>Pick up where you left off</CardDescription>
					</CardHeader>
					<div className="px-5 flex flex-wrap gap-4 *:data-[slot=card]:from-lime-400/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card  *:data-[slot=card]:bg-gradient-to-t">
						{courseInProgress.map(
							({ lesson, lessonsLeft, progress, title, description }) => {
								return (
									<Card
										key={lesson}
										className="w-full flex-1 min-w-[400px] bg-sidebar"
									>
										<CardContent>
											<div className="space-y-4">
												<div className="flex items-center justify-between">
													<div className="flex-[2.5]">
														<h3 className="font-semibold">{title}</h3>
														<p className="text-sm text-black/50 dark:text-white/50">
															{lesson}
														</p>
														<p className="text-sm mt-2 ">
															{description.slice(0, 70)}
														</p>
													</div>
													<div className="text-right flex-1">
														<div className="text-sm font-semibold text-lime-600">
															{progress}
														</div>
														<div className="text-xs text-yellow-500">
															{lessonsLeft} lessons left
														</div>
													</div>
												</div>
												<Progress value={75} className="h-2" />
												<Button className="w-full dark:bg-lime-600/30 dark:hover:bg-lime-600/20 dark:text-lime-400">
													Continue
												</Button>
											</div>
										</CardContent>
									</Card>
								);
							}
						)}
					</div>
				</Card>
			</div>
		</div>
	);
}
