"use client";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ArrowLeft, X, Check } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import CourseSidebar from "@/components/course-sidebar";
import CourseMobileSidebar from "@/components/course-mobile-sidebar";
import { cn, shuffleArray } from "@/lib/utils";
import Link from "next/link";

// --- DATABASE INTEGRATION ---
// 1. FETCH USER PROGRESS
async function fetchUserProgress(courseId: string) {
	// TODO: Implement your database logic to fetch user progress
	console.log(`Fetching progress for course: ${courseId}`);
	// Example return structure:
	return {
		current_lesson_id: "1-1",
		completed_lessons: [],
		quiz_answers: { "1-5": "Central Authority" },
	};
}

// 2. UPDATE USER PROGRESS
async function updateUserProgress(courseId: string, progress: any) {
	// TODO: Implement your database logic to save user progress
	console.log(`Updating progress for course: ${courseId}`, progress);
	// This function should handle upserting the data.
}

const CourseLearning = () => {
	const { id } = useParams();
	const router = useRouter();
	const courseId = Array.isArray(id) ? id[0] : id;

	const [isLoading, setIsLoading] = useState(true);
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

	const courseData = {
		id: "dkjsfkdjfla",
		title: "Introduction to DeFi: Decentralized Finance Fundamentals",
		description:
			"Plan your DeFi journey, from understanding basics to finding your ideal investment strategy",
		sections: [
			{
				title: "An Importance of Having a DeFi Foundation",
				lessons: [
					{
						id: "1-1",
						title: "What is DeFi?",
						type: "content",
						content:
							"DeFi, or Decentralized Finance, represents a shift from traditional, centralized financial systems to peer-to-peer finance enabled by decentralized technologies built on blockchain networks...",
					},
					{
						id: "1-2",
						title: "What Are the Benefits of DeFi for Modern Finance?",
						type: "content",
						content:
							"DeFi offers numerous advantages over traditional finance including 24/7 accessibility, global reach, transparency...",
					},
					{
						id: "1-3",
						title: "How to Apply DeFi Principles?",
						type: "content",
						content:
							"Understanding how to practically implement DeFi principles in your financial strategy...",
					},
					{
						id: "1-4",
						title: "Examples of DeFi Protocols",
						type: "content",
						content:
							"Real-world examples of successful DeFi protocols and their use cases...",
					},
					{
						id: "1-5",
						title: "Quiz #1",
						type: "quiz",
						question:
							"Which elements are NOT typically found in DeFi protocols?",
						options: [
							{ text: "Smart Contracts" },
							{ text: "Central Authority" },
							{ text: "Blockchain Technology" },
							{ text: "Cryptocurrency" },
							{ text: "Decentralized Governance" },
						],
						correctAnswer: "Central Authority",
					},
				],
			},
		],
	};

	const currentLessonData = useMemo(() => {
		return courseData.sections[currentSection].lessons[currentLesson];
	}, [currentSection, currentLesson]);

	const [shuffledOptions, setShuffledOptions] = useState<any[]>([]);

	useEffect(() => {
		const loadProgress = async () => {
			setIsLoading(true);
			const progress = await fetchUserProgress("courseId");
			if (progress) {
				// Restore state from DB
				setCompletedLessons(new Set(progress.completed_lessons || []));
				setQuizAnswers(progress.quiz_answers || {});

				if (progress.current_lesson_id) {
					let lessonFound = false;
					for (let i = 0; i < courseData.sections.length; i++) {
						const section = courseData.sections[i];
						const lessonIndex = section.lessons.findIndex(
							(l) => l.id === progress.current_lesson_id
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
			}
			setIsLoading(false);
		};

		loadProgress();
	}, [courseId]);

	useEffect(() => {
		if (currentLessonData.type === "quiz" && currentLessonData.options) {
			setShuffledOptions(shuffleArray(currentLessonData.options));
			setIsQuizActive(true);
		} else {
			setIsQuizActive(false);
		}
		// Reset submission status when lesson changes
		setQuizSubmissionStatus(null);
		setSelectedAnswer("");
	}, [currentLessonData]);

	const totalLessons = courseData.sections.reduce(
		(sum, section) => sum + section.lessons.length,
		0
	);
	const completedCount = completedLessons.size;
	const progressPercentage = (completedCount / totalLessons) * 100;

	const handleLessonComplete = async () => {
		const lessonId = currentLessonData.id;
		const newCompletedLessons = new Set([...completedLessons, lessonId]);
		setCompletedLessons(newCompletedLessons);

		let newQuizAnswers = { ...quizAnswers };

		if (currentLessonData.type === "quiz" && selectedAnswer) {
			newQuizAnswers = { ...quizAnswers, [lessonId]: selectedAnswer };
			setQuizAnswers(newQuizAnswers);
			const isCorrect = selectedAnswer === currentLessonData.correctAnswer;
			setQuizSubmissionStatus(isCorrect ? "correct" : "incorrect");
		} else {
			handleNext();
		}

		// --- DATABASE INTEGRATION ---
		await updateUserProgress("courseId", {
			completed_lessons: Array.from(newCompletedLessons),
			quiz_answers: newQuizAnswers,
		});
	};

	const handleNext = async () => {
		setQuizSubmissionStatus(null);
		setSelectedAnswer("");

		let nextSection = currentSection;
		let nextLesson = currentLesson + 1;

		if (nextLesson >= courseData.sections[currentSection].lessons.length) {
			nextSection += 1;
			nextLesson = 0;
		}

		if (nextSection >= courseData.sections.length) {
			router.push(`/course/${id}/performance`);
			return;
		}

		setCurrentSection(nextSection);
		setCurrentLesson(nextLesson);

		const nextLessonId =
			courseData.sections[nextSection].lessons[nextLesson].id;
		// --- DATABASE INTEGRATION ---
		await updateUserProgress("courseId", {
			current_lesson_id: nextLessonId,
		});
	};

	const handlePrevious = async () => {
		if (isQuizActive) {
			toast.warning(
				"You cannot go back to previous lessons while a quiz is active."
			);
			return;
		}

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
			// --- DATABASE INTEGRATION ---
			await updateUserProgress("courseId", {
				current_lesson_id: prevLessonId,
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
		setCurrentSection(sectionIndex);
		setCurrentLesson(lessonIndex);
		setSelectedAnswer("");

		const newLessonId =
			courseData.sections[sectionIndex].lessons[lessonIndex].id;
		// --- DATABASE INTEGRATION ---
		await updateUserProgress("courseId", {
			current_lesson_id: newLessonId,
		});
	};

	if (isLoading) {
		return <div>Loading...</div>; // Or a proper skeleton loader
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
				currentSection={currentSection}
				currentLesson={currentLesson}
				completedLessons={completedLessons}
				onNavigate={handleNavigate}
			/>

			<div className="flex-1 flex flex-col">
				{/* Header */}
				<div className="border-b px-6 py-4">
					<div className="flex items-center justify-between mb-3">
						<Link href={`/courses/${courseData.id}`}>
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
							<h1 className="font-semibold text-lg">{courseData.title}</h1>
							<p className="text-sm hidden lg:block">
								{courseData.description}
							</p>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="flex-1 p-6">
					<div className="max-w-4xl mx-auto">
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="text-xl">
										{currentLessonData.title}
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent>
								{currentLessonData.type === "content" ? (
									<div className="prose max-w-none">
										<p className="text-muted-foreground">
											{currentLessonData.content}
										</p>
									</div>
								) : (
									<div className="space-y-6">
										<p className="text-lg font-medium">
											{currentLessonData.question}
										</p>
										<RadioGroup
											value={selectedAnswer}
											onValueChange={setSelectedAnswer}
											disabled={quizSubmissionStatus !== null}
										>
											{shuffledOptions.map((option, index) => {
												const isSelected = selectedAnswer === option.text;
												const isCorrectAnswer =
													currentLessonData.correctAnswer === option.text;
												const isSubmitted = quizSubmissionStatus !== null;

												return (
													<Button
														variant={"outline"}
														key={index}
														className={cn(
															"flex items-center space-x-3 rounded-lg border",
															isSubmitted &&
																isCorrectAnswer &&
																"!border-green-500 bg-green-100 text-green-500 hover:!text-green-500",
															isSubmitted &&
																isSelected &&
																!isCorrectAnswer &&
																"!border-red-500 bg-red-100 text-red-500 hover:!text-red-500"
														)}
													>
														<RadioGroupItem
															value={option.text}
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
													</Button>
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
									quizSubmissionStatus !== null
										? handleNext
										: handleLessonComplete
								}
								disabled={!selectedAnswer && currentLessonData.type === "quiz"}
								variant={
									quizSubmissionStatus !== null
										? "nextLesson"
										: currentLessonData.type === "quiz"
											? "checkAnswer"
											: "default"
								}
							>
								{quizSubmissionStatus !== null
									? "Next Lesson"
									: currentLessonData.type === "quiz"
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

export default CourseLearning;
