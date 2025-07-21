"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Star, Heart } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CourseRating from "@/components/course-rating";
import CourseLike from "@/components/course-like";
import CourseContent from "@/components/course-content";
import Image from "next/image";
import featuredCourseImage from "@/public/featured-course.svg";
import Link from "next/link";

const CourseDetail = () => {
	const router = useRouter();
	const [isExpanded, setIsExpanded] = useState(false);

	const courseData = {
		id: "sdfkjsdf",
		title: "Gamification: Motivation Psychology & The Art of Engagement",
		description:
			"Learn how to motivate and engage anyone by learning the psychology that underpins human behaviour.",
		rating: 4.5,
		imageUrl: null,
		totalRatings: 1324,
		instructor: {
			name: "Anastasia Miller",
			avatar: "AM",
			title: "UX Designer",
			rating: 4.5,
			reviews: 8544,
			students: 13245,
			courses: 4,
		},
		likes: 42,
		duration: "2h 30m",
		price: 8.99,
		originalPrice: 10.95,
		discount: "20% Off",
		features: [
			"3 hours on-demand video",
			"Full lifetime access",
			"Access on mobile and TV",
		],
		learningOutcomes: [
			"Understand the psychology of human behaviour",
			"Build an engagement plan to create change in a community",
			"Motivate your students, staff, customers, users and yourself",
		],
		requirements: [
			"You must have an open mind",
			"You'll need to invest time in the student discussions",
			"Ideally you'll have a community to test your ideas on",
		],
	};

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
						{/* Course Header */}
						<div>
							<h1 className="text-3xl font-bold mb-4">{courseData.title}</h1>
							<p className="text-muted-foreground mb-4">
								{courseData.description}
							</p>

							{/* Rating and Stats */}
							<div className="flex items-center gap-4 mb-2">
								<div className="flex items-center gap-2">
									<span className="text-lg font-semibold">
										{courseData.rating}
									</span>
									<div className="flex">
										{[...Array(5)].map((_, i) => (
											<Star
												key={i}
												className={`w-4 h-4 ${i < Math.floor(courseData.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
											/>
										))}
									</div>
									<span className="text-sm text-muted-foreground">
										({courseData.totalRatings} ratings)
									</span>
								</div>

								<div className="flex items-center gap-4 text-sm">
									<span className="flex items-center gap-1">
										<Heart className={`w-4 h-4 fill-red-500 text-red-500`} />
										{courseData.likes} likes
									</span>
								</div>
							</div>

							{/* Instructor */}
							<div className="flex items-center gap-3 mb-6">
								<Avatar className="h-8 w-8">
									<AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
										{courseData.instructor.avatar}
									</AvatarFallback>
								</Avatar>
								<span className="font-medium">
									{courseData.instructor.name}
								</span>
							</div>
						</div>

						{/* What you'll learn */}
						<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
							<Card className="relative">
								<CardHeader>
									<CardTitle className="text-xl">What you'll learn</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid md:grid-cols-2 gap-3">
										{courseData.learningOutcomes.map((outcome, index) => (
											<div key={index} className="flex items-start gap-2">
												<div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></div>
												<span className="text-sm">{outcome}</span>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Description */}
						<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
							<Card className="relative">
								<CardHeader>
									<CardTitle className="text-xl">Description</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4 text-sm">
										<p>
											The Art of Engagement and The Psychology of Motivation is
											a course that will teach you about human beings and what
											encourages them to do the things they do. This unique
											course is inspired not just from text books and science
											experiments, but from personal, first hand experience.
											Experience teaching children, managing teams and design
											applications.
										</p>
										{isExpanded && (
											<p>
												This comprehensive course will give you the tools and
												knowledge to understand what drives people and how to
												create meaningful engagement in any context.
											</p>
										)}
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

						{/* Course Content */}
						<CourseContent />

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
									alt={courseData.title}
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
									<Link href={`/courses/${courseData.id}/learning`}>
										<Button variant="outline" className="flex-1">
											Start Course
										</Button>
									</Link>
									<CourseLike />
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

export default CourseDetail;
