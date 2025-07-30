"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Star, Heart, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CourseLike from "@/components/course-like";
import CourseContent from "@/components/course-content";
import Image from "next/image";
import featuredCourseImage from "@/public/featured-course.svg";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/auth-client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const Page = () => {
	const { id } = useParams();
	const router = useRouter();
	const [isExpanded, setIsExpanded] = useState(false);
	const [enrollmentLoading, setEnrollmentLoading] = useState(false);
	const { data: session } = useSession();

	const {
		data: courseData,
		isPending,
		error,
	} = useQuery({
		queryKey: ["course", id],
		queryFn: async () => {
			const courseData = await supabase
				.from("courses")
				.select(
					`
					*,
					sections (
						*,
						lessons(*)
					)
					`
				)
				.eq("id", id)
				.single();
			if (courseData.error) {
				throw new Error(courseData.error.message);
			}
			return courseData.data;
		},
	});

	const handleStartCourse = async (id: string) => {
		setEnrollmentLoading(true);

		toast.loading("You are being enrolled in the course please wait...", {
			id: "enroll-course",
		});

		if (!session || !session.user) {
			toast.error("You must be logged in to start a course.");
			return;
		}
		try {
			const { error } = await supabase
				.from("enrollments")
				.insert([{ user_id: session?.user.id, course_id: id }]);

			if (error) {
				if (error.message.includes("enrollments_course_id_key")) {
					toast.dismiss("enroll-course");
					router.push(`/courses/${id}/learning`);
					return;
				}

				throw new Error(error.message);
			}
			toast.dismiss("enroll-course");
			toast.success("Enrollment Success!", {
				description: courseData?.title
					? `You have been enrolled in ${courseData.title}`
					: "You have been successfully enrolled.",
			});

			router.push(`/courses/${id}/learning`);
		} catch (error: any) {
			toast.dismiss("enroll-course");
			console.error("Error starting course:", error);
			toast.error("Failed to start course. Please try again.");
		} finally {
			setEnrollmentLoading(false);
		}
	};

	const EmptyState = () => (
		<div className="flex flex-col items-center justify-center py-20">
			{/* <Image
				src="/empty-state.svg"
				alt="No Data"
				width={200}
				height={200}
				className="mb-6"
			/> */}
			<h2 className="text-xl font-semibold mb-2">No course data found</h2>
			<p className="text-sm text-muted-foreground mb-4">
				This course may have been removed or is unavailable.
			</p>
			<Link href={"/courses"}>
				<Button>Go back to courses</Button>
			</Link>
		</div>
	);

	const NetworkErrorState = () => (
		<div className="flex flex-col items-center justify-center py-20">
			<Image
				src="/network-error.svg"
				alt="Network Error"
				width={200}
				height={200}
				className="mb-6"
			/>
			<h2 className="text-xl font-semibold mb-2">Network error</h2>
			<p className="text-sm text-muted-foreground mb-4">
				Couldn't connect to the internet. Please check your connection and try
				again.
			</p>
			<Button onClick={() => location.reload()}>Retry</Button>
		</div>
	);

	if (isPending) {
		return (
			<div className="min-h-screen">
				<div className="container mx-auto px-6 py-8">
					<div className="flex items-center gap-4 mb-6">
						<Skeleton className="h-8 w-24 rounded-md" />
					</div>

					<div className="grid lg:grid-cols-5 gap-4">
						{/* Left Content */}
						<div className="lg:col-span-3 space-y-4">
							{/* Title */}
							<Skeleton className="h-8 w-2/3" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-1/2 mb-4" />

							{/* Rating + Likes */}
							<div className="flex items-center gap-4">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-4 w-12" />
							</div>

							{/* Instructor */}
							<div className="flex items-center gap-3 mb-6">
								<Skeleton className="h-8 w-8 rounded-full" />
								<Skeleton className="h-4 w-24" />
							</div>

							{/* What you'll learn card */}
							<Card>
								<CardHeader>
									<Skeleton className="h-6 w-1/3" />
								</CardHeader>
								<CardContent className="grid md:grid-cols-2 gap-3">
									{Array.from({ length: 4 }).map((_, i) => (
										<div key={i} className="flex items-center gap-2">
											<Skeleton className="w-2 h-2 rounded-full" />
											<Skeleton className="h-4 w-48" />
										</div>
									))}
								</CardContent>
							</Card>

							{/* Description card */}
							<Card>
								<CardHeader>
									<Skeleton className="h-6 w-1/3" />
								</CardHeader>
								<CardContent className="space-y-2">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-5/6" />
									<Skeleton className="h-4 w-1/2" />
								</CardContent>
							</Card>

							{/* Course content (sections/lessons placeholder) */}
							<Card>
								<CardHeader>
									<Skeleton className="h-6 w-1/3" />
								</CardHeader>
								<CardContent className="space-y-3">
									{Array.from({ length: 3 }).map((_, i) => (
										<Skeleton key={i} className="h-4 w-full" />
									))}
								</CardContent>
							</Card>
						</div>

						{/* Sidebar */}
						<div className="lg:col-span-2">
							<Card className="sticky top-14">
								<CardContent className="p-6 space-y-6">
									<Skeleton className="w-[70%] h-40 mx-auto" />

									<div className="space-y-2">
										<Skeleton className="h-10 w-full" />
										<Skeleton className="h-10 w-1/2" />
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		if (error.message.includes("NetworkError") || !navigator.onLine) {
			return <NetworkErrorState />;
		}

		return <EmptyState />;
	}

	if (!courseData) {
		return <EmptyState />;
	}

	const ratings = courseData?.rating ?? [];
	const averageRating =
		ratings.length > 0
			? ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length
			: 0;

	return (
		<div className="min-h-screen">
			<div className="container mx-auto px-6 py-8">
				{/* Header */}
				<div className="flex items-center gap-4 mb-6">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => router.push("/")}
						className="flex items-center gap-2"
					>
						<ArrowLeft className="w-4 h-4" />
						Courses
					</Button>
				</div>

				<div className="grid lg:grid-cols-5 gap-4">
					{/* Main Content */}
					<div className="lg:col-span-3 space-y-4">
						<div>
							<h1 className="text-3xl font-bold mb-4">{courseData?.title}</h1>
							<p className="text-muted-foreground mb-4">
								{courseData?.description}
							</p>

							<div className="flex items-center gap-4 mb-2">
								<div className="flex items-center gap-2">
									<div className="flex items-center gap-2">
										<div className="flex">
											{[...Array(5)].map((_, i) => (
												<Star
													key={i}
													className={`w-4 h-4 ${
														i < Math.round(averageRating)
															? "fill-yellow-400 text-yellow-400"
															: "text-gray-300"
													}`}
												/>
											))}
										</div>
										<span className="text-sm text-muted-foreground">
											({ratings.length} ratings)
										</span>
									</div>
								</div>

								<div className="flex items-center gap-4 text-sm">
									{courseData?.likes?.length > 0 && (
										<span className="flex items-center gap-1">
											<Heart className={`w-4 h-4 fill-red-500 text-red-500`} />
											{courseData?.likes?.length} likes
										</span>
									)}
								</div>
							</div>

							<div className="flex items-center gap-3 mb-6">
								<Avatar className="h-8 w-8 rounded-full grayscale">
									<AvatarImage
										src={courseData?.instructor_avatar || ""}
										alt={courseData?.instructor_name || ""}
									/>
									<AvatarFallback className="rounded-full">
										{session?.user?.name?.charAt(0) ?? "AN"}
									</AvatarFallback>
								</Avatar>
								<span className="font-medium">
									{courseData?.instructor_name}
								</span>
							</div>
						</div>

						<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
							<Card className="relative">
								<CardHeader>
									<CardTitle className="text-xl">What you'll learn</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid md:grid-cols-2 gap-3">
										{courseData?.learning_outcomes?.map(
											(outcome: string, index: number) => (
												<div key={index} className="flex items-start gap-2">
													<div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></div>
													<span className="text-sm">{outcome}</span>
												</div>
											)
										)}
									</div>
								</CardContent>
							</Card>
						</div>

						<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
							<Card className="relative">
								<CardHeader>
									<CardTitle className="text-xl">Description</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4 text-sm">
										<p>
											{isExpanded
												? courseData?.long_description
												: courseData?.long_description?.slice(0, 200) + "..."}
										</p>

										<Button
											variant="ghost"
											onClick={() => setIsExpanded(!isExpanded)}
											className="p-0 h-auto text-emerald-600 hover:text-emerald-700"
										>
											{isExpanded ? "Show less" : "Show more"}
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>

						<CourseContent courseContent={courseData?.sections} />

						{/* Instructor Section */}
						{/* <Card>
							<CardHeader>
								<CardTitle className="text-xl">Instructor</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex items-start gap-4">
									<Avatar className="h-16 w-16">
										<AvatarFallback className="bg-emerald-100 text-emerald-700 text-xl">
											{courseData.instructor.avatar}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1">
										<h3 className="font-semibold text-lg mb-1">
											{courseData.instructor.name}
										</h3>
										<p className="text-gray-600 mb-3">
											{courseData.instructor.title}
										</p>

										<div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
											<span className="flex items-center gap-1">
												<Star className="w-4 h-4" />
												{courseData.instructor.rating} Instructor Rating
											</span>
											<span className="flex items-center gap-1">
												<Trophy className="w-4 h-4" />
												{courseData.instructor.reviews.toLocaleString()} Reviews
											</span>
											<span className="flex items-center gap-1">
												<Users className="w-4 h-4" />
												{courseData.instructor.students.toLocaleString()}{" "}
												Students
											</span>
											<span>{courseData.instructor.courses} Courses</span>
										</div>

										<p className="text-gray-700 text-sm">
											I spent three years teaching english in Seoul. I loved
											seeing the progress of my students and I loved knowing
											they were having a good time in my class. I learnt about
											how to write a solid lesson plan the only way I believe
											anyone can... by seeing the results right there in front
											of me.
										</p>
									</div>
								</div>
							</CardContent>
						</Card> */}
					</div>

					{/* Sidebar */}

					<div className="lg:col-span-2 *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
						<Card className="sticky top-14">
							{/* Course Preview Image */}

							<CardContent className="p-6">
								<Image
									src={courseData?.imageUrl ?? featuredCourseImage}
									alt={courseData?.title}
									width={300}
									height={200}
									className="object-contain w-[70%] mx-auto h-auto invert-0 dark:invert"
								/>
								{/* Price */}
								{/* <div className="flex items-center gap-2 my-4">
									<span className="text-2xl font-bold">{courseData.price}</span>
									<span className="text-gray-500 line-through">
										{courseData.originalPrice}
									</span>
									<Badge variant="destructive" className="bg-red-500">
										{courseData.discount}
									</Badge>
								</div> */}

								{/* Action Buttons */}
								<div className="space-y-3 my-6 flex flex-wrap gap-4">
									<Button
										disabled={enrollmentLoading}
										onClick={() => handleStartCourse(courseData.id)}
										variant="outline"
										className="flex-1"
									>
										{enrollmentLoading && (
											<LoaderCircle className="animate-spin" size={16} />
										)}
										{enrollmentLoading ? "Please wait..." : "Start Course"}
									</Button>
									<CourseLike courseId={id} />
									{/* <div className="flex gap-2">
										<CourseRating />
									</div> */}
								</div>

								{/* Course Includes */}
								{/* <div>
									<h4 className="font-semibold mb-3">This course includes:</h4>
									<div className="space-y-2">
										{courseData.features.map((feature, index) => (
											<div
												key={index}
												className="flex items-center gap-2 text-sm"
											>
												{feature.includes("video") && (
													<Play className="w-4 h-4 text-gray-600" />
												)}
												{feature.includes("lifetime") && (
													<Infinity className="w-4 h-4 text-gray-600" />
												)}
												{feature.includes("mobile") && (
													<Smartphone className="w-4 h-4 text-gray-600" />
												)}
												<span>{feature}</span>
											</div>
										))}
									</div>
								</div> */}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Page;
