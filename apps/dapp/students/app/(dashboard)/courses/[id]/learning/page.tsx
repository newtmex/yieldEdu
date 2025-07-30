"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, X, Check, AlertCircle, WifiOff } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import CourseSidebar from "@/components/course-sidebar";
import CourseMobileSidebar from "@/components/course-mobile-sidebar";
import { cn, shuffleArray } from "@/lib/utils";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import LessonContent from "@/components/LessonContent";

function transformCourseData(fetchedData: any) {
	if (!fetchedData) return null;
	return {
		id: fetchedData.id,
		title: fetchedData?.title,
		description: fetchedData.description,
		sections: fetchedData?.sections?.map((section: any, i: number) => {
			const lessons =
				section.lessons?.map((lesson: any) => {
					const contentText = lesson?.content?.blocks;
					return {
						id: lesson.id,
						title: lesson?.title,
						type: "content",
						content: contentText || "",
					};
				}) || [];

			const quizzes =
				section.quizzes?.map((quiz: any, index: number) => ({
					id: quiz.id,
					title: `Quiz #${index}`,
					type: "quiz",
					question: quiz?.question || "",
					options: quiz?.options?.map((option: string) => ({
						text: option,
					})),

					correct_answer: quiz?.options[quiz?.correct_answer] || "",
				})) || [];

			return {
				title: section?.title || `Section ${i + 1}`,
				lessons: [...lessons, ...quizzes], // merge quizzes and lessons
			};
		}),
	};
}

const Page = () => {
	const { id } = useParams();
	const router = useRouter();
	const courseId = Array.isArray(id) ? id[0] : id;
	const { data: session } = useSession();

	const [currentSection, setCurrentSection] = useState(0);
	const [currentLesson, setCurrentLesson] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState("");
	const [completedLessons, setCompletedLessons] = useState<Set<string>>(
		new Set()
	);
	const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
	const [isQuizActive, setIsQuizActive] = useState(false);
	const [quizSubmissionStatus, setQuizSubmissionStatus] = useState<
		"correct" | "incorrect" | null
	>(null);

	const { data, isPending } = useQuery({
		queryKey: ["learn", id],
		queryFn: async () => {
			const response = await supabase
				.from("courses")
				.select("*, sections(lessons(*),quizzes(*))")
				.eq("id", courseId)
				.single();
			if (response.error) {
				throw new Error(response.error.message);
			}
			return response.data;
		},
	});

	const courseData = useMemo(() => transformCourseData(data), [data]);

	const { data: existingProgress, isPending: existingProgressPending } =
		useQuery({
			queryKey: ["user_progress", session?.user.id, courseId],
			queryFn: async () => {
				if (!session?.user.id || !courseId) return null;
				const { data, error } = await supabase
					.from("user_course_progress")
					.select("*")
					.eq("user_id", session?.user.id)
					.eq("course_id", courseId)
					.single();
				if (error && error.code !== "PGRST116") {
					// Ignore 'not found' error
					throw new Error(error.message);
				}
				return data;
			},
			enabled: !!session?.user.id && !!courseId,
		});

	const updateUserProgress = async (progress: any) => {
		if (!session?.user.id || !courseId) return;

		const { error } = await supabase
			.from("user_course_progress")
			.update({
				...progress,
				updated_at: new Date().toISOString(),
			})
			.eq("user_id", session.user.id)
			.eq("course_id", courseId);

		if (error) {
			toast.error("Failed to update progress", {
				description: error.message,
			});
		}
	};

	useEffect(() => {
		const handleProgress = async () => {
			if (
				existingProgressPending ||
				!session?.user.id ||
				!courseId ||
				!courseData
			) {
				return;
			}

			if (!existingProgress) {
				// Create new progress
				const now = new Date().toISOString();
				const firstLessonId = courseData.sections[0]?.lessons[0]?.id;

				if (!firstLessonId) return;

				const { error: insertError } = await supabase
					.from("user_course_progress")
					.insert([
						{
							user_id: session?.user.id,
							course_id: courseId,
							current_lesson: firstLessonId,
							current_section: currentSection,
							completed_lessons: [],
							quiz_answers: quizAnswers,
							started_at: now,
							updated_at: now,
						},
					]);

				if (insertError) {
					toast.error("Failed to create progress", {
						description: insertError.message,
					});
				}
			} else {
				// Load existing progress
				if (existingProgress.current_lesson) {
					let lessonFound = false;
					for (let i = 0; i < courseData.sections.length; i++) {
						const section = courseData.sections[i];
						const lessonIndex = section.lessons.findIndex(
							(l: any) => l.id === existingProgress.current_lesson
						);
						if (lessonIndex !== -1) {
							setCurrentSection(i);
							setCurrentLesson(lessonIndex);
							lessonFound = true;
							break;
						}
					}
					if (!lessonFound) {
						setCurrentSection(0);
						setCurrentLesson(0);
					}
				}
				setCompletedLessons(new Set(existingProgress.completed_lessons || []));
				setQuizAnswers(existingProgress.quiz_answers || {});
			}
		};
		handleProgress();
	}, [
		existingProgress,
		existingProgressPending,
		session?.user.id,
		courseId,
		courseData,
	]);

	const currentLessonData = useMemo(() => {
		if (!courseData || !courseData.sections[currentSection]) return null;
		return courseData.sections[currentSection].lessons[currentLesson];
	}, [courseData, currentSection, currentLesson]);

	const currentLessonData2 = useMemo(() => {
		if (!courseData || !courseData.sections[currentSection]) return null;
		return data?.sections[currentSection]?.lessons[currentLesson];
	}, [courseData, currentSection, currentLesson]);

	const [shuffledOptions, setShuffledOptions] = useState<any[]>([]);

	useEffect(() => {
		if (currentLessonData?.type === "quiz" && currentLessonData.options) {
			setShuffledOptions(shuffleArray(currentLessonData.options));
		}
	}, [currentLessonData]);

	useEffect(() => {
		if (currentLessonData?.type === "quiz") {
			const savedAnswer = quizAnswers[currentLessonData.id];
			if (savedAnswer) {
				setSelectedAnswer(savedAnswer);
				const isCorrect =
					savedAnswer.trim() ===
					(currentLessonData.correct_answer ?? "").trim();
				setQuizSubmissionStatus(isCorrect ? "correct" : "incorrect");
			} else {
				setQuizSubmissionStatus(null);
				setSelectedAnswer("");
			}
			setIsQuizActive(true);
		} else {
			setIsQuizActive(false);
			setQuizSubmissionStatus(null);
			setSelectedAnswer("");
		}
	}, [currentLessonData, quizAnswers]);

	const totalLessons = courseData?.sections.reduce(
		(sum: number, section: (typeof courseData)["sections"]) =>
			sum + section.lessons.length,
		0
	);
	const completedCount = completedLessons.size;
	const progressPercentage =
		totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

	const handleQuizSubmit = async () => {
		const lessonId = currentLessonData?.id;
		if (!lessonId || !selectedAnswer) return;

		const isCorrect =
			selectedAnswer.trim() === (currentLessonData.correct_answer ?? "").trim();
		setQuizSubmissionStatus(isCorrect ? "correct" : "incorrect");

		const newCompletedLessons = new Set(completedLessons);
		if (!newCompletedLessons.has(lessonId)) {
			newCompletedLessons.add(lessonId);
			setCompletedLessons(newCompletedLessons);
		}

		const newQuizAnswers = { ...quizAnswers, [lessonId]: selectedAnswer };
		setQuizAnswers(newQuizAnswers);

		await updateUserProgress({
			completed_lessons: Array.from(newCompletedLessons),
			quiz_answers: newQuizAnswers,
		});
	};

	const handleLessonComplete = async () => {
		const lessonId = currentLessonData?.id;
		if (!lessonId) return;

		if (currentLessonData?.type === "quiz") {
			handleQuizSubmit();
			return;
		}

		const newCompletedLessons = new Set(completedLessons);
		if (!newCompletedLessons.has(lessonId)) {
			newCompletedLessons.add(lessonId);
			setCompletedLessons(newCompletedLessons);
		}

		await updateUserProgress({
			completed_lessons: Array.from(newCompletedLessons),
		});
		handleNext();
	};

	const isLastLesson = useMemo(() => {
		if (!courseData || courseData.sections.length === 0) {
			return false;
		}
		const lastSectionIndex = courseData.sections.length - 1;
		const lastLessonIndex =
			courseData.sections[lastSectionIndex].lessons.length - 1;
		return (
			currentSection === lastSectionIndex && currentLesson === lastLessonIndex
		);
	}, [courseData, currentSection, currentLesson]);

	const handleNext = async () => {
		setQuizSubmissionStatus(null);
		setSelectedAnswer("");

		if (!courseData) return;

		let nextSection = currentSection;
		let nextLesson = currentLesson + 1;

		if (nextLesson >= courseData.sections[currentSection].lessons.length) {
			nextSection += 1;
			nextLesson = 0;
		}

		if (nextSection >= courseData.sections.length) {
			router.push(`/courses/${id}/performance`);
		}

		setCurrentSection(nextSection);
		setCurrentLesson(nextLesson);

		const nextLessonId =
			courseData.sections[nextSection].lessons[nextLesson].id;
		await updateUserProgress({
			current_lesson: nextLessonId,
		});
	};

	const handlePrevious = async () => {
		if (isQuizActive) {
			toast.warning(
				"You cannot go back to previous lessons while a quiz is active."
			);
			return;
		}
		if (!courseData) return;

		let prevSection = currentSection;
		let prevLesson = currentLesson - 1;

		if (prevLesson < 0) {
			prevSection -= 1;
			if (prevSection >= 0) {
				prevLesson = courseData.sections[prevSection].lessons.length - 1;
			}
		}

		if (prevSection >= 0) {
			setCurrentSection(prevSection);
			setCurrentLesson(prevLesson);
			setSelectedAnswer("");

			const prevLessonId =
				courseData.sections[prevSection].lessons[prevLesson].id;
			await updateUserProgress({
				current_lesson: prevLessonId,
			});
		}
	};

	const handleNavigate = async (sectionIndex: number, lessonIndex: number) => {
		if (isQuizActive) {
			toast.warning(
				"You cannot navigate to other lessons while a quiz is active."
			);
			return;
		}
		if (!courseData) return;

		setCurrentSection(sectionIndex);
		setCurrentLesson(lessonIndex);
		setSelectedAnswer("");

		const newLessonId =
			courseData.sections[sectionIndex].lessons[lessonIndex].id;
		await updateUserProgress({
			current_lesson: newLessonId,
		});
	};

	const handleCourseCompletion = async () => {
		// update course completion
		try {
			const { error } = await supabase
				.from("enrollments")
				.update({ completed: true })
				.eq("course_id", courseId)
				.eq("user_id", session?.user.id)
				.select();

			if (error?.message) {
				throw new Error(error.message);
			}
			toast.success(`${courseData?.title} completed!`);
			router.push(`/courses/${id}/performance`);
			return;
		} catch (error: any) {
			console.log(error);
			toast.error("Could not update course completion", {
				description: error.message,
			});
		}
	};

	if (isPending || existingProgressPending) {
		return (
			<div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6 p-6">
				{/* Sidebar skeleton */}
				<Skeleton className="space-y-4 h-screen p-5">
					<Skeleton className="h-6 w-3/4 bg-primary/5" />
					<div className="space-y-3">
						{Array.from({ length: 4 })?.map((_, i) => (
							<Skeleton key={i} className="h-4 w-full bg-primary/5" />
						))}
					</div>

					<Skeleton className="h-6 w-3/4 mt-6 bg-primary/5" />
					<div className="space-y-3">
						{Array.from({ length: 3 })?.map((_, i) => (
							<Skeleton key={i} className="h-4 w-full bg-primary/5" />
						))}
					</div>
				</Skeleton>

				{/* Main content skeleton */}
				<Skeleton className="space-y-4 p-5">
					<Skeleton className="h-8 w-2/3 bg-primary/5" />
					<Skeleton className="h-6 w-1/3 bg-primary/5" />
					{Array.from({ length: 5 })?.map((_, i) => (
						<Skeleton key={i} className="h-4 w-full bg-primary/5" />
					))}
					<Skeleton className="h-4 w-5/6 bg-primary/5" />
				</Skeleton>
			</div>
		);
	}

	if (!navigator.onLine) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
				<WifiOff className="w-16 h-16 text-muted-foreground mb-4" />
				<p className="text-lg font-medium">You're offline</p>
				<p className="text-sm text-muted-foreground">
					Check your connection and try again.
				</p>
			</div>
		);
	}

	if (!isPending && (!courseData || !courseData.sections?.length)) {
		return (
			<div className="flex flex-col items-center justify-center h-80 text-center space-y-4">
				<AlertCircle className="h-10 w-10 text-muted-foreground" />
				<p className="text-lg font-medium">Course not found</p>
				<p className="text-sm text-muted-foreground">
					We couldn’t find the course you’re looking for.
				</p>
				<Link href={"/courses"}>
					<Button>Back to courses</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex">
			<CourseSidebar
				course={courseData}
				currentSection={currentSection}
				currentLesson={currentLesson}
				onNavigate={handleNavigate}
				completedLessons={completedLessons}
				className="hidden lg:block lg:sticky lg:top-12"
			/>
			<CourseMobileSidebar
				course={courseData}
				currentSection={currentSection}
				currentLesson={currentLesson}
				completedLessons={completedLessons}
				onNavigate={handleNavigate}
			/>

			<div className="flex-1 flex flex-col">
				{/* Header */}
				<div className="border-b px-6 py-4">
					<div className="flex items-center justify-between mb-3">
						<Link href={`/courses/${courseData?.id}`}>
							<Button
								variant="ghost"
								size="sm"
								className="flex items-center gap-2"
							>
								<ArrowLeft className="w-4 h-4" />
								Back
							</Button>
						</Link>

						<div className="flex items-center gap-4">
							<div className="text-right">
								<div className="text-sm font-medium">
									{completedCount}/{totalLessons}
								</div>
								<Progress value={progressPercentage} className="w-30" />
							</div>
						</div>
					</div>
					<div className="flex items-center flex-wrap gap-4">
						<div className="text-center flex-1">
							<h1 className="font-semibold text-lg">{courseData?.title}</h1>
							<p className="text-sm hidden lg:block">
								{courseData?.description}
							</p>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="flex-1 p-6">
					<div className="max-w-4xl mx-auto">
						<Card>
							<CardHeader className="w-full text-center">
								<CardTitle className="text-xl">
									{currentLessonData?.title}
								</CardTitle>
							</CardHeader>
							<CardContent>
								{currentLessonData?.type === "content" ? (
									<div className="prose max-w-none">
										<LessonContent content={currentLessonData2?.content} />
									</div>
								) : (
									<div className="space-y-6">
										<p className="text-lg font-medium">
											{currentLessonData?.question}
										</p>
										<RadioGroup
											value={selectedAnswer}
											onValueChange={setSelectedAnswer}
											disabled={quizSubmissionStatus !== null}
										>
											{shuffledOptions?.map((option, index) => {
												const isSelected = selectedAnswer === option.text;
												const isCorrectAnswer =
													currentLessonData?.correct_answer === option.text;
												const isSubmitted = quizSubmissionStatus !== null;

												return (
													<div key={option}>
														<Button
															variant={"outline"}
															key={index}
															disabled={quizSubmissionStatus !== null}
															onClick={() => setSelectedAnswer(option.text)}
															className={cn(
																"space-x-3 rounded-lg border justify-start",
																isSubmitted &&
																	isCorrectAnswer &&
																	"!border-green-500 bg-green-100 text-green-500 hover:!text-green-500",
																isSubmitted &&
																	isSelected &&
																	!isCorrectAnswer &&
																	"!border-red-500 bg-red-100 text-red-500 hover:!text-red-500"
															)}
														>
															<div className="flex gap-2 justify-start items-center">
																<RadioGroupItem
																	value={
																		isSubmitted && !isSelected
																			? `obfuscated-${index}`
																			: option.text
																	}
																	id={option.text}
																/>
																<Label
																	htmlFor={option.text}
																	className="flex-1 cursor-pointer py-3 flex items-center gap-2"
																>
																	<span className="font-semibold text-muted-foreground">
																		{String.fromCharCode(65 + index)}.
																	</span>
																	{option.text}
																	{isSubmitted && isCorrectAnswer && (
																		<Check className="w-5 h-5 text-green-400" />
																	)}
																	{isSubmitted &&
																		isSelected &&
																		!isCorrectAnswer && (
																			<X className="w-5 h-5 text-red-400" />
																		)}
																</Label>
															</div>
														</Button>
													</div>
												);
											})}
										</RadioGroup>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Navigation */}
						<div className="flex justify-between items-center mt-6">
							<Button
								variant="outline"
								onClick={handlePrevious}
								disabled={
									(currentSection === 0 && currentLesson === 0) || isQuizActive
								}
							>
								Previous
							</Button>

							<Button
								onClick={
									isLastLesson && quizSubmissionStatus !== null
										? async () => await handleCourseCompletion()
										: quizSubmissionStatus !== null
											? handleNext
											: handleLessonComplete
								}
								disabled={!selectedAnswer && currentLessonData?.type === "quiz"}
								variant={
									quizSubmissionStatus !== null
										? "nextLesson"
										: currentLessonData?.type === "quiz"
											? "checkAnswer"
											: "default"
								}
							>
								{isLastLesson && quizSubmissionStatus !== null
									? "Complete Course"
									: quizSubmissionStatus !== null
										? "Next Lesson"
										: currentLessonData?.type === "quiz"
											? "Check Answer"
											: "Mark Complete"}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Page;
