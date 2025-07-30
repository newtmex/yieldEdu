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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

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

type ProgressData = {
	current_section: any;
	current_lesson: any;
	completed_lessons: any;
	course: {
		id: string;
		title: string;
		description: string;
		sections: {
			id: string;
			lessons: {
				id: string;
				title: string;
			}[];
			quizzes: {
				id: string;
				question: string;
			}[];
		}[];
	};
};

export default function Page() {
	// const { isInitialized, authState, ocAuth, OCId, ethAddress } = useOCAuth();
	const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);
	const [swiperInstance2, setSwiperInstance2] = useState<SwiperType | null>(
		null
	);
	const { open } = useSidebar();
	const { data: session } = useSession();

	const { data: courses, isPending } = useQuery({
		queryKey: ["featured-courses"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("courses")
				.select("title,id,description,image_url")
				.eq("featured", true);
			if (error) {
				throw new Error(error.message);
			}
			return data;
		},
	});
	const { data: progressData, isPending: isProgressPending } = useQuery({
		queryKey: ["courses-in-progress", session?.user.id],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("user_course_progress")
				.select(
					`
					  current_section,
					  current_lesson,
					  completed_lessons,
					  course:course_id (
						id,
						title,
						description,
						sections (
						  id,
						  lessons (
							id,
							title,
							course_id
						  ),
						  quizzes (
							id,
							question
						  )
						)
					  )
					`
				)

				.eq("user_id", session?.user.id);

			if (error) {
				throw new Error(error.message);
			}
			return data;
		},
	});

	const courseInProgress = progressData?.map((item) => {
		const { course, completed_lessons, current_section, current_lesson } = item;

		const typedCourse = course as unknown as ProgressData["course"];
		const totalLessons = typedCourse.sections?.reduce(
			(total, section) => total + section.lessons.length,
			0
		);
		const completedCount = completed_lessons?.length ?? 0;
		const percentage = totalLessons
			? Math.min(100, Math.round((completedCount / totalLessons) * 100))
			: 0;

		const lessonsLeft = Math.max(0, totalLessons - completedCount);

		const section = typedCourse.sections?.[current_section];
		let lessonTitle = "Continue Learning";

		if (section) {
			const foundLesson = section.lessons.find(
				(lesson) => lesson.id === current_lesson
			);

			if (foundLesson) {
				const lessonIndex = section.lessons.findIndex(
					(l) => l.id === current_lesson
				);
				lessonTitle = `Lesson ${lessonIndex + 1}: ${foundLesson.title}`;
			} else {
				const foundQuiz = section?.quizzes?.find(
					(quiz) => quiz.id === current_lesson
				);
				if (foundQuiz) {
					const quizIndex = section?.quizzes?.findIndex(
						(q) => q.id === current_lesson
					);
					lessonTitle = `Quiz ${quizIndex + 1}: ${foundQuiz.question}`;
				}
			}
		}

		return {
			title: typedCourse.title,
			lesson: lessonTitle,
			description: typedCourse.description,
			progress: percentage,
			lessonsLeft,
			id: typedCourse.id,
		};
	});

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
			<div className="px-4 pb-5">
				<div className="flex items-center w-full justify-between">
					<h2 className="font-semibold">Featured Courses</h2>
					<Link href={"/courses"}>
						<Button variant={"secondary"}>Explore More</Button>
					</Link>
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
						{isPending ? (
							Array.from({ length: 5 }).map((_, idx) => (
								<SwiperSlide key={idx} className="py-1">
									<Card className="grid grid-cols-2 gap-5 w-full rounded-xl p-5 animate-pulse">
										<div>
											<Skeleton className="h-4 w-full bg-primary/5 rounded" />
											<div className="pt-4 flex flex-col gap-2">
												<Skeleton className="h-2 w-[200px] bg-primary/5 rounded" />
												<Skeleton className="h-2 w-[180px] bg-primary/5 rounded" />
												<Skeleton className="h-2 w-[170px] bg-primary/5 rounded" />
											</div>
											<div className="space-y-2 pt-7">
												<Skeleton className="h-8 w-[110px] bg-primary/5 rounded" />
											</div>
										</div>
										<div className="w-full h-[170px] bg-primary/5 rounded" />
									</Card>
								</SwiperSlide>
							))
						) : courses && courses.length > 0 ? (
							courses.map((course) => (
								<SwiperSlide key={course.id} className="py-1">
									<CourseCard {...course} />
								</SwiperSlide>
							))
						) : !navigator.onLine ? (
							<div className="col-span-full flex flex-col items-center justify-center py-12">
								<p className="text-lg font-semibold text-red-500">
									No internet connection
								</p>
								<p className="text-muted-foreground text-sm mt-2">
									Please check your network and try again.
								</p>
							</div>
						) : (
							<div className="col-span-full flex flex-col items-center justify-center py-12">
								<p className="text-lg font-semibold">
									No featured courses available
								</p>
							</div>
						)}
					</Swiper>
					<SwiperNavButtons swiper={swiperInstance2} />
				</div>
			</div>
			<div className="p-5 *:data-[slot=card]:from-lime-400/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card  *:data-[slot=card]:bg-gradient-to-t">
				{isProgressPending ? (
					<ContinueLearningSkeleton />
				) : (
					<Card>
						<CardHeader>
							<CardTitle>Continue Learning</CardTitle>
							<CardDescription>Pick up where you left off</CardDescription>
						</CardHeader>
						<div
							className={cn(
								"px-5 grid gap-4 grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(400px,1fr))] *:data-[slot=card]:from-lime-400/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card  *:data-[slot=card]:bg-gradient-to-t",
								{
									"grid-cols-1 sm:grid-cols-1":
										courseInProgress && courseInProgress.length < 1,
								}
							)}
						>
							{courseInProgress && courseInProgress.length < 1 ? (
								<div className="text-center py-12">
									<h2 className="text-xl font-semibold">No Progress Yet</h2>
									<p className="my-3 text-primary/40">
										Enroll in a course to start learning and track your progress
										here.
									</p>
									<Link href={"/courses"}>
										<Button>Explore Courses</Button>
									</Link>
								</div>
							) : (
								courseInProgress?.map(
									({
										lesson,
										lessonsLeft,
										progress,
										title,
										description,
										id,
									}) => {
										return (
											<Card key={id} className="w-full flex-1 bg-sidebar">
												<CardContent>
													<div className="space-y-4">
														<div className="flex flex-col gap-4 sm:flex-row justify-between">
															<div className="">
																<h3 className="font-semibold">{title}</h3>
																<p className="text-sm text-black/50 dark:text-white/50">
																	{lesson}
																</p>
																<p className="text-sm mt-2 ">
																	{description.slice(0, 70)}
																</p>
															</div>
															<div className="text-right">
																<div className="text-sm whitespace-nowrap font-semibold text-lime-600">
																	{progress}% Complete
																</div>
																<div className="text-xs text-yellow-500">
																	{lessonsLeft} lessons left
																</div>
															</div>
														</div>
														<Progress value={progress} className="h-2" />
														{progress >= 100 ? (
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
									}
								)
							)}
						</div>
					</Card>
				)}
			</div>
		</div>
	);
}

const ContinueLearningSkeleton = () => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<Skeleton className="h-5 w-40" />
				</CardTitle>
				<CardDescription>
					<Skeleton className="h-5 w-50" />
				</CardDescription>
			</CardHeader>
			<div className="px-5 grid gap-4 grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(400px,1fr))] *:data-[slot=card]:from-lime-400/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t">
				{Array.from({ length: 2 }).map((_, i) => (
					<Card key={i} className="w-full flex-1 bg-sidebar">
						<CardContent>
							<div className="space-y-4">
								<div className="flex flex-col gap-4 sm:flex-row justify-between">
									<div className="space-y-2">
										<Skeleton className="h-5 w-40" />
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-4 w-56 mt-2" />
									</div>
									<div className="text-right space-y-2">
										<Skeleton className="h-4 w-12 ml-auto" />
										<Skeleton className="h-3 w-20 ml-auto" />
									</div>
								</div>
								<Skeleton className="h-2 w-full" />
								<Skeleton className="h-9 w-full rounded-md" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</Card>
	);
};
