import { CourseFormData } from "@/app/(dashboard)/courses/create-course/page";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "./ui/badge";
import { Heart, HelpCircle, Star } from "lucide-react";
import { Button } from "./ui/button";
import CourseCard from "./course-card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import CourseContent from "./course-content";
import Image from "next/image";

type extendedCourseData = CourseFormData & {
	instructor: {
		name: string | undefined;
		avatar: string | null | undefined;
	};
	imageUrl: any;
};

const CoursePreview: React.FC<{ courseData: extendedCourseData }> = ({
	courseData,
}) => {
	const [isExpanded, setIsExpanded] = useState(false);

	const MAX_LENGTH = 200;
	const description = courseData?.longDescription || "";
	const shouldTruncate = description.length > MAX_LENGTH;
	const visibleText = isExpanded
		? description
		: description.slice(0, MAX_LENGTH);

	const [expandedQuizzes, setExpandedQuizzes] = useState<Set<string>>(
		new Set()
	);

	const toggleQuiz = (sectionIndex: number) => {
		const key = `quiz-${sectionIndex}`;
		const newExpanded = new Set(expandedQuizzes);
		if (newExpanded.has(key)) {
			newExpanded.delete(key);
		} else {
			newExpanded.add(key);
		}
		setExpandedQuizzes(newExpanded);
	};

	return (
		<div className="space-y-6">
			<CourseCard
				difficulty={courseData.difficulty}
				Category={courseData.category || "Category"}
				description={
					courseData.description || "Course description will appear here..."
				}
				title={courseData.title || "Course Title"}
				rating={[]}
			/>

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
									{/* {courseData.rating} */}
									{4.5}
								</span>
								<div className="flex">
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											className={`w-4 h-4 ${
												i <
												Math.floor(
													4.5 // courseData.rating
												)
													? "fill-yellow-400 text-yellow-400"
													: "text-gray-300"
											}`}
										/>
									))}
								</div>
								<span className="text-sm text-muted-foreground">
									{/* ({courseData.totalRatings} ratings) */}({350} ratings)
								</span>
							</div>

							<div className="flex items-center gap-4 text-sm">
								<span className="flex items-center gap-1">
									<Heart className={`w-4 h-4 fill-red-500 text-red-500`} />
									{/* {courseData.likes} likes */}
									{270} likes
								</span>
							</div>
						</div>

						{/* Instructor */}
						<div className="flex items-center gap-3 mb-6">
							<Avatar className="h-8 w-8 rounded-full grayscale">
								<AvatarImage
									src={courseData.instructor.avatar || ""}
									alt={courseData.instructor.name}
								/>
								<AvatarFallback className="rounded-full">
									{courseData.instructor.name?.charAt(0) ?? "AN"}
								</AvatarFallback>
							</Avatar>
							<span className="font-medium">{courseData.instructor.name}</span>
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
									{courseData.whatYouWillLearn
										.filter((item) => item.trim())
										.map((item, index) => (
											<div key={index} className="flex items-start gap-2">
												<div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></div>
												<span className="text-sm">{item}</span>
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
									<p className="inline break-words">
										{visibleText}
										{!isExpanded && shouldTruncate && "..."}
									</p>{" "}
									{shouldTruncate && (
										<Button
											variant="ghost"
											onClick={() => setIsExpanded(!isExpanded)}
											className="p-0 h-auto text-emerald-600 hover:text-emerald-700"
										>
											{isExpanded ? "Show less" : "Show more"}
										</Button>
									)}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Course Content */}
					<CourseContent courseContent={courseData.sections} />
				</div>

				{/* Sidebar */}

				<div className="lg:col-span-2 *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
					<Card className="sticky top-14">
						{/* Course Preview Image */}

						<CardContent className="p-6">
							<Image
								src={courseData?.imageUrl}
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
								<Button variant="outline" className="flex-1">
									Start Course
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
			<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
				<Card>
					<CardHeader>
						<CardTitle>Quizzes</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						{courseData.sections.map((section, sectionIndex) => (
							<div
								key={sectionIndex}
								className="border rounded-lg p-4 space-y-3"
							>
								{/* Quiz */}
								{section.lessons.map((lesson, lessonIndex) => (
									<div key={lessonIndex}>
										{courseData?.quizzes?.length > 0 && (
											<div className="border rounded-md">
												<Button
													variant="ghost"
													className="w-full justify-between p-4 h-auto"
													onClick={() => toggleQuiz(sectionIndex)}
												>
													<div className="flex items-center gap-3">
														<HelpCircle className="h-4 w-4" />
														<span className="font-medium">Quiz</span>
														<Badge variant="outline" className="ml-2">
															{courseData?.quizzes.length} questions
														</Badge>
													</div>
												</Button>

												{expandedQuizzes.has(`quiz-${sectionIndex}`) && (
													<div className="p-4 border-t bg-muted/30 space-y-10">
														{courseData?.quizzes.map(
															(question, questionIndex) => (
																<div key={questionIndex} className="space-y-4">
																	<h5 className="font-medium">
																		{questionIndex + 1}.{" "}
																		{question.question ||
																			"Question text will appear here..."}
																	</h5>
																	<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
																		{question.options.map(
																			(option, optionIndex) => (
																				<div
																					key={optionIndex}
																					className={`p-2 rounded border text-sm ${
																						question.correctAnswer ===
																						optionIndex
																							? "bg-green-50 border-green-200 text-green-800"
																							: "bg-background"
																					}`}
																				>
																					<div className="flex items-center gap-2">
																						<span className="font-medium">
																							{String.fromCharCode(
																								65 + optionIndex
																							)}
																							.
																						</span>
																						<span>
																							{option ||
																								`Option ${optionIndex + 1}`}
																						</span>
																						{question.correctAnswer ===
																							optionIndex && (
																							<span className="ml-auto text-green-600 text-xs">
																								✓ Correct
																							</span>
																						)}
																					</div>
																				</div>
																			)
																		)}
																	</div>
																</div>
															)
														)}
													</div>
												)}
											</div>
										)}
									</div>
								))}
							</div>
						))}
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default CoursePreview;
