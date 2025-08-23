import { ArrowLeft, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { getAllLessons, lessonsInterface } from "@/data/lessons";

// This would be fetched from an API in a real application

export default async function ReviewLessonPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const getLessonById = async (
		id: string
	): Promise<lessonsInterface | undefined> => {
		const getLessons = await getAllLessons();
		const lessons = getLessons.data?.find((lesson) => lesson.id === id);

		if (lessons) return lessons;
	};

	const lessonId = await params;
	const lesson = await getLessonById(lessonId.id);

	if (!lesson) {
		return <div className="text-center py-10">Lesson not found</div>;
	}

	return (
		<div className="container max-w-4xl mx-auto py-8">
			<div className="mb-6">
				<Link
					href="/dashboard/learn"
					className="flex items-center text-muted-foreground hover:text-primary"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Learning Center
				</Link>
			</div>

			<div className="flex flex-wrap gap-3 items-center justify-between mb-6">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
					<p className="text-muted-foreground">{lesson.description}</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Clock className="h-5 w-5 text-muted-foreground" />
					<span className="text-muted-foreground">{lesson.duration}</span>
					{lesson.completed && (
						<div className="ml-4 flex items-center gap-1 text-green-500">
							<CheckCircle className="h-5 w-5" />
							<span>Completed</span>
						</div>
					)}
				</div>
			</div>

			<Card className="mb-8 dark:!border-lime-400/20 bg-lime-400/10">
				<CardHeader>
					<CardTitle>Lesson Content</CardTitle>
					<CardDescription>
						Review the key concepts from this lesson
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* {lesson.sections.map((section, sectionIndex) => (
						<div key={sectionIndex}>
							<h2 className="text-xl font-semibold mt-6">{section.title}</h2>

							{section.content.map((content, contentIndex) => {
								if (content.type === "heading") {
									return (
										<h2
											key={contentIndex}
											className="text-xl font-semibold mt-6"
										>
											{content.content}
										</h2>
									);
								} else if (content.type === "paragraph") {
									return (
										<p key={contentIndex} className="text-muted-foreground">
											{content.content}
										</p>
									);
								} else if (content.type === "list") {
									return (
										<ul key={contentIndex} className="list-disc pl-6 space-y-2">
											{content.items?.map((item, itemIndex) => (
												<li key={itemIndex} className="text-muted-foreground">
													{item}
												</li>
											))}
										</ul>
									);
								}
								return null;
							})}
						</div>
					))} */}
				</CardContent>
			</Card>

			<Card className="dark:!border-white/20">
				<CardHeader>
					<CardTitle>Knowledge Check</CardTitle>
					<CardDescription>
						Test your understanding of the lesson concepts
					</CardDescription>
				</CardHeader>
				<CardContent>
					{/* {lesson.quiz.map((question, index) => (
						<div key={index} className="mb-6">
							<h3 className="font-medium mb-2">
								Question {index + 1}: {question.question}
							</h3>
							<div className="space-y-2">
								{question.options.map((option, optionIndex) => (
									<div
										key={optionIndex}
										className={`p-3 rounded-md border ${
											optionIndex === question.correctAnswer
												? "border-green-500 bg-green-50 dark:bg-green-950/20"
												: "dark:border-gray-300/10 border-black/10"
										}`}
									>
										<div className="flex items-start">
											<div className="flex-shrink-0 mr-2">
												{optionIndex === question.correctAnswer ? (
													<CheckCircle className="h-5 w-5 text-green-500" />
												) : (
													<div className="h-5 w-5 rounded-full border border-muted-foreground flex items-center justify-center">
														<span className="text-xs">
															{String.fromCharCode(65 + optionIndex)}
														</span>
													</div>
												)}
											</div>
											<span
												className={
													optionIndex === question.correctAnswer
														? "font-medium"
														: ""
												}
											>
												{option}
											</span>
										</div>
									</div>
								))}
							</div>
						</div>
					))} */}
				</CardContent>
			</Card>

			<div className="mt-8 w-fit ml-auto">
				<Button asChild>
					<Link href="/dashboard/learn">Back to Learning Center</Link>
				</Button>
			</div>
		</div>
	);
}
