"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	ArrowLeft,
	Trophy,
	Star,
	Clock,
	BookOpen,
	TrendingUp,
	Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";

const PerformanceHistory = () => {
	const router = useRouter();

	// Mock data for completed courses
	const completedCourses = [
		{
			id: "1",
			title: "Introduction to DeFi: Decentralized Finance Fundamentals",
			completionDate: "2023-12-15",
			score: 85,
			grade: "B+",
			timeSpent: "4h 32m",
			sectionsCompleted: 5,
			totalSections: 5,
			category: "Finance",
		},
		{
			id: "2",
			title: "Advanced Blockchain Concepts",
			completionDate: "2023-11-28",
			score: 92,
			grade: "A-",
			timeSpent: "6h 15m",
			sectionsCompleted: 8,
			totalSections: 8,
			category: "Technology",
		},
		{
			id: "3",
			title: "Smart Contract Development",
			completionDate: "2023-11-10",
			score: 78,
			grade: "C+",
			timeSpent: "8h 45m",
			sectionsCompleted: 10,
			totalSections: 12,
			category: "Development",
		},
	];

	const getGradeColor = (score: number) => {
		if (score >= 90) return "text-green-600 bg-green-100";
		if (score >= 80) return "text-blue-600 bg-blue-100";
		if (score >= 70) return "text-yellow-600 bg-yellow-100";
		return "text-red-600 bg-red-100";
	};

	const getScoreIcon = (score: number) => {
		if (score >= 90) return <Trophy className="w-5 h-5 text-yellow-500" />;
		if (score >= 80) return <Star className="w-5 h-5 text-blue-500" />;
		return <BookOpen className="w-5 h-5 text-gray-500" />;
	};

	const averageScore = Math.round(
		completedCourses.reduce((sum, course) => sum + course.score, 0) /
			completedCourses.length
	);
	const totalTimeMinutes = completedCourses.reduce((sum, course) => {
		const [hours, minutes] = course.timeSpent
			.replace("h", "")
			.replace("m", "")
			.split(" ");
		return sum + parseInt(hours) * 60 + parseInt(minutes);
	}, 0);
	const totalHours = Math.floor(totalTimeMinutes / 60);
	const remainingMinutes = totalTimeMinutes % 60;

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-6 py-8 max-w-6xl">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => router.push("/")}
							className="flex items-center gap-2"
						>
							<ArrowLeft className="w-4 h-4" />
							Back to Courses
						</Button>
						<div>
							<h1 className="text-2xl font-bold">My Performance</h1>
							<p className="text-gray-600">
								Track your learning progress and achievements
							</p>
						</div>
					</div>
				</div>

				{/* Summary Cards */}
				<div className="grid md:grid-cols-3 gap-6 mb-8">
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
									<BookOpen className="w-6 h-6 text-blue-600" />
								</div>
								<div>
									<p className="text-2xl font-bold">
										{completedCourses.length}
									</p>
									<p className="text-sm text-gray-600">Courses Completed</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
									<TrendingUp className="w-6 h-6 text-green-600" />
								</div>
								<div>
									<p className="text-2xl font-bold">{averageScore}%</p>
									<p className="text-sm text-gray-600">Average Score</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
									<Clock className="w-6 h-6 text-purple-600" />
								</div>
								<div>
									<p className="text-2xl font-bold">
										{totalHours}h {remainingMinutes}m
									</p>
									<p className="text-sm text-gray-600">Total Study Time</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Course History */}
				<Card>
					<CardHeader>
						<CardTitle className="text-xl">Course History</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{completedCourses.map((course) => (
								<div
									key={course.id}
									className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
								>
									<div className="flex items-start justify-between mb-3">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-1">
												{getScoreIcon(course.score)}
												<h3 className="font-semibold">{course.title}</h3>
												<Badge variant="outline" className="text-xs">
													{course.category}
												</Badge>
											</div>
											<div className="flex items-center gap-4 text-sm text-gray-600">
												<span className="flex items-center gap-1">
													<Calendar className="w-4 h-4" />
													Completed{" "}
													{new Date(course.completionDate).toLocaleDateString()}
												</span>
												<span className="flex items-center gap-1">
													<Clock className="w-4 h-4" />
													{course.timeSpent}
												</span>
												<span>
													{course.sectionsCompleted}/{course.totalSections}{" "}
													sections
												</span>
											</div>
										</div>
										<div className="flex items-center gap-3">
											<div className="text-right">
												<div className="flex items-center gap-2 mb-1">
													<span className="text-lg font-bold">
														{course.score}%
													</span>
													<Badge className={getGradeColor(course.score)}>
														{course.grade}
													</Badge>
												</div>
												<Progress value={course.score} className="w-20" />
											</div>
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													router.push(`/course/${course.id}/performance`)
												}
											>
												View Details
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default PerformanceHistory;
