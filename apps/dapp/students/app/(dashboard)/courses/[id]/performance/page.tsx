"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	ArrowLeft,
	Trophy,
	Star,
	CheckCircle,
	XCircle,
	RotateCcw,
	BookOpen,
	Clock,
	Target,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const CoursePerformance = () => {
	const { id } = useParams();
	const router = useRouter();

	// Mock performance data - in real app this would come from user's actual progress
	const performanceData = {
		courseName: "Introduction to DeFi: Decentralized Finance Fundamentals",
		completionDate: "December 15, 2023",
		totalTime: "4h 32m",
		overallScore: 85,
		grade: "B+",
		sectionsCompleted: 5,
		totalSections: 5,
		quizzesCompleted: 2,
		totalQuizzes: 2,
		correctAnswers: 7,
		totalQuestions: 10,
		sections: [
			{
				title: "An Importance of Having a DeFi Foundation",
				score: 85,
				timeSpent: "54m",
				completed: true,
				quizResults: [
					{
						question:
							"Which elements are NOT typically found in DeFi protocols?",
						userAnswer: "B",
						correctAnswer: "B",
						isCorrect: true,
					},
					{
						question: "What is the main benefit of DeFi?",
						userAnswer: "A",
						correctAnswer: "C",
						isCorrect: false,
					},
				],
			},
		],
	};

	const getGradeColor = (score: number) => {
		if (score >= 90) return "text-green-600 bg-green-100";
		if (score >= 80) return "text-blue-600 bg-blue-100";
		if (score >= 70) return "text-yellow-600 bg-yellow-100";
		return "text-red-600 bg-red-100";
	};

	const getScoreIcon = (score: number) => {
		if (score >= 90) return <Trophy className="w-5 h-5 text-yellow-500" />;
		if (score >= 80) return <Star className="w-5 h-5 text-blue-500" />;
		return <Target className="w-5 h-5 text-gray-500" />;
	};

	return (
		<div className="min-h-screen">
			<div className="container mx-auto px-6 py-8 max-w-4xl">
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
				<Card className="mb-6 bg-gradient-to-r ">
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
								<span className="flex items-center gap-1">
									<Clock className="w-4 h-4" />
									{performanceData.totalTime}
								</span>
								<span>Completed on {performanceData.completionDate}</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Overall Performance */}
				<div className="grid md:grid-cols-2 gap-6 mb-6">
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
											{Math.round(
												(performanceData.correctAnswers /
													performanceData.totalQuestions) *
													100
											)}
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
										{performanceData.sectionsCompleted}/
										{performanceData.totalSections}
									</span>
								</div>
								<div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
									<div className="flex items-center gap-2">
										<CheckCircle className="w-4 h-4 text-green-500" />
										<span>Quizzes Passed</span>
									</div>
									<span className="font-semibold">
										{performanceData.quizzesCompleted}/
										{performanceData.totalQuizzes}
									</span>
								</div>
								<div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
									<div className="flex items-center gap-2">
										<Clock className="w-4 h-4 text-lime-500" />
										<span>Time Spent</span>
									</div>
									<span className="font-semibold">
										{performanceData.totalTime}
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
							{performanceData.sections.map((section, index) => (
								<div key={index} className="border rounded-lg p-4">
									<div className="flex items-center justify-between mb-3">
										<h3 className="font-semibold">{section.title}</h3>
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
											{section.quizResults.map((quiz, quizIndex) => (
												<div
													key={quizIndex}
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
											))}
										</div>
									)}
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Button
						variant="outline"
						onClick={() => router.push(`/course/${id}/learning`)}
						className="flex items-center gap-2"
					>
						<RotateCcw className="w-4 h-4" />
						Review Course
					</Button>
					<Button
						onClick={() => router.push("/")}
						className="bg-lime-600 hover:bg-lime-700"
					>
						Explore More Courses
					</Button>
				</div>
			</div>
		</div>
	);
};

export default CoursePerformance;
