"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import confetti from "canvas-confetti";
import {
	ArrowLeft,
	Trophy,
	Star,
	CheckCircle,
	XCircle,
	RotateCcw,
	BookOpen,
	Target,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

type Quiz = {
	question: string;
	id: string;
	options: string[];
	correct_answer: number;
	selectedAnswer?: number;
};

type Section = {
	title: string;
	description?: string;
	lessons?: string[];
	quizzes: Quiz[];
};

type ProgressData =
	| {
			quiz_answers: any;
			completed_lessons: any;
			updated_at: any;
			course: {
				id: any;
				title: any;
				sections: any[];
			};
	  }
	| undefined;

const CoursePerformance = () => {
	const { id } = useParams();
	const router = useRouter();
	const { data: session } = useSession();

	const { data: progressData, isPending } = useQuery({
		queryKey: ["completed_course", id],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("user_course_progress")
				.select(
					`
                     quiz_answers,
                     completed_lessons,
                     updated_at,
                     course:course_id (
                       id,
                       title,
                       sections (
                         id,
                         title,
                         quizzes (
                           id,
                           question,
                           correct_answer,
						   options
                         )
                       )
                     )
                     `
				)
				.eq("user_id", session?.user.id)
				.eq("course_id", id)
				.single();

			if (error) {
				throw new Error(error.message);
			}

			return data;
		},
	});

	const allSections = (progressData as ProgressData)?.course.sections;
	const quizAnswers = progressData?.quiz_answers || {};
	const sectionResults = allSections?.map((section: Section) => {
		const quizResults = section?.quizzes?.map((quiz: Quiz) => {
			const userAnswer = quizAnswers[quiz.id];
			const correctAnswer = quiz?.options?.[quiz?.correct_answer];
			const isCorrect = userAnswer === correctAnswer;

			return {
				id: quiz.id,
				question: quiz.question,
				userAnswer,
				correctAnswer,
				isCorrect,
			};
		});

		const score =
			quizResults?.length > 0
				? Math.round(
						(quizResults.filter((q) => q.isCorrect)?.length /
							quizResults?.length) *
							100
					)
				: 0;

		return {
			sectionTitle: section.title,
			completed: section.quizzes.every((q) => quizAnswers[q.id]),
			score,
			quizResults,
		};
	});

	const correctAnswers = sectionResults?.reduce(
		(sum: number, section: { quizResults: { isCorrect: boolean }[] }) =>
			sum +
			section.quizResults.filter((q: { isCorrect: boolean }) => q.isCorrect)
				?.length,
		0
	);

	const totalQuestions = sectionResults?.reduce(
		(sum: number, section: { quizResults: any[] }) =>
			sum + section.quizResults?.length,
		0
	);

	const sectionsCompleted = sectionResults?.filter(
		(s: { completed: boolean }) => s.completed
	)?.length;
	const totalSections = allSections?.length;

	const getGrade = (accuracy: number) => {
		if (accuracy >= 90) return "A";
		if (accuracy >= 80) return "B+";
		if (accuracy >= 70) return "B";
		if (accuracy >= 60) return "C";
		return "F";
	};

	const performanceData = {
		courseName: (progressData as ProgressData)?.course?.title,
		completionDate: new Date(progressData?.updated_at).toLocaleDateString(
			undefined,
			{
				year: "numeric",
				month: "long",
				day: "numeric",
			}
		),
		overallScore:
			(totalQuestions ?? 0) > 0 && (correctAnswers ?? 0) >= 0
				? Math.round(((correctAnswers ?? 0) / (totalQuestions ?? 1)) * 100)
				: 0,
		grade: getGrade(
			(totalQuestions ?? 0) > 0 && (correctAnswers ?? 0) >= 0
				? ((correctAnswers ?? 0) / (totalQuestions ?? 1)) * 100
				: 0
		),
		sectionsCompleted,
		totalSections,
		quizzesCompleted: Object.keys(quizAnswers)?.length,
		totalQuizzes: totalQuestions,
		correctAnswers,
		totalQuestions,
		sections: sectionResults,
	};

	const getGradeColor = (score: number) => {
		if (score >= 90) return "text-white bg-green-900";
		if (score >= 80) return "text-white bg-blue-900";
		if (score >= 70) return "text-white bg-yellow-900";
		return "text-white bg-red-900";
	};

	const getScoreIcon = (score: number) => {
		if (score >= 90) return <Trophy className="w-5 h-5 text-yellow-500" />;
		if (score >= 80) return <Star className="w-5 h-5 text-blue-500" />;
		return <Target className="w-5 h-5 text-gray-500" />;
	};

	useEffect(() => {
		if (progressData && progressData.completed_lessons?.length > 0) {
			confetti({
				particleCount: 100,
				spread: 70,
				origin: { y: 0.6, x: 0.6 },
			});
		}
	}, [progressData]);

	return isPending ? (
		<CoursePerformanceSkeleton />
	) : !progressData ? (
		<div className="text-center py-10">
			<p className="text-lg font-semibold mb-4">
				You haven't enrolled in this course.
			</p>
			<Link href="/" className="text-blue-600 underline">
				<Button>Go back to Home</Button>
			</Link>
		</div>
	) : (
		<div className="min-h-screen">
			<div className="container mx-auto px-6 py-8 max-w-4xl *:data-[slot=card]:from-lime-400/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card  *:data-[slot=card]:bg-gradient-to-t">
				{/* Header */}
				<div className="flex items-center gap-4 mb-6">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => router.push("/")}
						className="flex items-center gap-2"
					>
						<ArrowLeft className="w-4 h-4" />
						Back to Courses
					</Button>
				</div>

				{/* Course Completion Header */}
				<Card className="mb-6">
					<CardContent className="p-6">
						<div className="text-center">
							<div className="w-16 h-16 bg-lime-600 rounded-full flex items-center justify-center mx-auto mb-4">
								<Trophy className="size-8" />
							</div>
							<h1 className="text-2xl font-bold mb-2">Congratulations!</h1>
							<p className="text-muted-foreground mb-4">
								You've completed {performanceData.courseName}
							</p>
							<div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
								<span>Completed on {performanceData.completionDate}</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Overall Performance */}
				<div className="grid md:grid-cols-2 gap-6 mb-6 *:data-[slot=card]:from-lime-400/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card  *:data-[slot=card]:bg-gradient-to-t">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg flex items-center gap-2">
								{getScoreIcon(performanceData.overallScore)}
								Overall Performance
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-3xl font-bold">
										{performanceData.overallScore}%
									</span>
									<Badge
										className={getGradeColor(performanceData.overallScore)}
									>
										Grade: {performanceData.grade}
									</Badge>
								</div>
								<Progress
									value={performanceData.overallScore}
									className="h-2"
								/>
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<p className="text-muted-foreground">Sections Completed</p>
										<p className="font-semibold">
											{performanceData.sectionsCompleted}/
											{performanceData.totalSections}
										</p>
									</div>
									<div>
										<p className="text-muted-foreground">Quiz Accuracy</p>
										<p className="font-semibold">
											{performanceData.correctAnswers}/
											{performanceData.totalQuestions} (
											{performanceData.correctAnswers !== undefined &&
											performanceData.totalQuestions !== undefined &&
											performanceData.totalQuestions > 0
												? Math.round(
														(performanceData.correctAnswers /
															performanceData.totalQuestions) *
															100
													)
												: 0}
											%)
										</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Quick Stats</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="flex items-center justify-between p-3 rounded-lg">
									<div className="flex items-center gap-2">
										<BookOpen className="w-4 h-4 text-blue-500" />
										<span>Sections</span>
									</div>
									<span className="font-semibold">
										{performanceData?.sectionsCompleted}/
										{performanceData?.totalSections}
									</span>
								</div>
								<div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
									<div className="flex items-center gap-2">
										<CheckCircle className="w-4 h-4 text-green-500" />
										<span>Quizzes Passed</span>
									</div>
									<span className="font-semibold">
										{performanceData?.quizzesCompleted}/
										{performanceData?.totalQuizzes}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Detailed Section Performance */}
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="text-lg">Section Performance</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{performanceData.sections?.map(
								(
									section: {
										sectionTitle: string;
										completed: boolean;
										score: number;
										timeSpent?: string;
										quizResults?: {
											id: string;
											question: string;
											userAnswer: any;
											correctAnswer: string;
											isCorrect: boolean;
										}[];
									},
									index: number
								) => (
									<div key={index} className="border rounded-lg p-4">
										<div className="flex items-center justify-between mb-3">
											<h3 className="font-semibold">{section.sectionTitle}</h3>
											<div className="flex items-center gap-2">
												<Badge variant="outline">{section.score}%</Badge>
												<span className="text-sm text-muted-foreground">
													{section.timeSpent}
												</span>
											</div>
										</div>
										<Progress value={section.score} className="mb-3" />

										{section.quizResults && (
											<div className="space-y-2">
												<h4 className="font-medium text-sm">Quiz Results:</h4>
												{section.quizResults.map(
													(
														quiz: {
															id: string;
															question: string;
															userAnswer: any;
															correctAnswer: string;
															isCorrect: boolean;
														},
														quizIndex: number
													) => (
														<div
															key={quiz.id ?? quizIndex}
															className="flex items-start gap-2 p-2 bg-secondary rounded text-sm"
														>
															{quiz.isCorrect ? (
																<CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
															) : (
																<XCircle className="w-4 h-4 text-red-500 mt-0.5" />
															)}
															<div className="flex-1">
																<p className="font-medium">{quiz.question}</p>
																<p className="text-muted-foreground">
																	Your answer:{" "}
																	<span
																		className={
																			quiz.isCorrect
																				? "text-green-600"
																				: "text-red-600"
																		}
																	>
																		{quiz.userAnswer}
																	</span>
																	{!quiz.isCorrect && (
																		<span className="text-muted-foreground">
																			{" "}
																			(Correct: {quiz.correctAnswer})
																		</span>
																	)}
																</p>
															</div>
														</div>
													)
												)}
											</div>
										)}
									</div>
								)
							)}
						</div>
					</CardContent>
				</Card>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Link href={`/courses/${id}`}>
						<Button variant="outline" className="flex items-center gap-2">
							<RotateCcw className="w-4 h-4" />
							Review Course
						</Button>
					</Link>
					<Link href={"/courses"}>
						<Button className="bg-lime-600 hover:bg-lime-700">
							Explore More Courses
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default CoursePerformance;

const CoursePerformanceSkeleton = () => {
	return (
		<div className="min-h-screen">
			<div className="container mx-auto px-6 py-8 max-w-4xl">
				<div className="flex items-center gap-4 mb-6">
					<Skeleton className="h-8 w-40" />
				</div>

				{/* Completion Header */}
				<Card className="mb-6">
					<CardContent className="p-6 text-center space-y-4">
						<div className="w-16 h-16 rounded-full mx-auto bg-lime-200 animate-pulse" />
						<Skeleton className="h-6 w-48 mx-auto" />
						<Skeleton className="h-4 w-64 mx-auto" />
						<Skeleton className="h-4 w-40 mx-auto" />
					</CardContent>
				</Card>

				{/* Performance and Stats */}
				<div className="grid md:grid-cols-2 gap-6 mb-6">
					{[...Array(2)].map((_, i) => (
						<Card key={i}>
							<CardHeader>
								<Skeleton className="h-5 w-48" />
							</CardHeader>
							<CardContent className="space-y-4">
								<Skeleton className="h-8 w-20" />
								<Skeleton className="h-4 w-full" />
								<div className="grid grid-cols-2 gap-4">
									<Skeleton className="h-4 w-24" />
									<Skeleton className="h-4 w-24" />
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Section Performance */}
				<Card className="mb-6">
					<CardHeader>
						<Skeleton className="h-5 w-40" />
					</CardHeader>
					<CardContent className="space-y-4">
						{[...Array(2)].map((_, i) => (
							<div key={i} className="border rounded-lg p-4 space-y-4">
								<Skeleton className="h-5 w-40" />
								<Skeleton className="h-2 w-full" />
								{[...Array(2)].map((_, j) => (
									<div
										key={j}
										className="flex items-start gap-2 bg-secondary p-2 rounded"
									>
										<Skeleton className="w-4 h-4 rounded-full" />
										<div className="flex-1 space-y-2">
											<Skeleton className="h-4 w-full" />
											<Skeleton className="h-3 w-2/3" />
										</div>
									</div>
								))}
							</div>
						))}
					</CardContent>
				</Card>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Skeleton className="h-10 w-40" />
					<Skeleton className="h-10 w-52" />
				</div>
			</div>
		</div>
	);
};
