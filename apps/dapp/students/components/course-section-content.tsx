import { Minus, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import dynamic from "next/dynamic";

const LessonEditor = dynamic(
	() => import("@/components/lesson-editor").then((mod) => mod.LessonEditor),
	{ ssr: false }
);

const SectionContent: React.FC<{
	sectionIndex: number;
	form: any;
	onSubmit: any;
	isPending: boolean;
}> = ({ sectionIndex, form, onSubmit, isPending }) => {
	const watchedSection = form.watch(`sections.${sectionIndex}`);

	return (
		<div className="space-y-6">
			{/* Lessons */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h4 className="font-medium">Lessons</h4>
						<p className="text-sm text-muted-foreground">
							Create lessons with rich content
						</p>
					</div>
					<Button
						type="button"
						onClick={() => {
							const currentLessons = form.getValues(
								`sections.${sectionIndex}.lessons`
							);
							form.setValue(`sections.${sectionIndex}.lessons`, [
								...currentLessons,
								{ title: "", content: null, isPreview: false },
							]);
						}}
						variant="outline"
						size="sm"
						className="gap-2"
						disabled={isPending}
					>
						<Plus className="h-4 w-4" />
						Add Lesson
					</Button>
				</div>

				{watchedSection?.lessons?.map((lesson: any, lessonIndex: number) => (
					<div
						key={lessonIndex}
						className="p-4 bg-muted/50 rounded-lg space-y-4"
					>
						<div className="flex items-center justify-between">
							<Badge variant="outline">Lesson {lessonIndex + 1}</Badge>
							{watchedSection.lessons.length > 1 && (
								<Button
									type="button"
									onClick={() => {
										const currentLessons = form.getValues(
											`sections.${sectionIndex}.lessons`
										);
										const newLessons = currentLessons.filter(
											(_: any, i: number) => i !== lessonIndex
										);
										form.setValue(
											`sections.${sectionIndex}.lessons`,
											newLessons
										);
									}}
									variant="ghost"
									size="sm"
									className="text-destructive"
									disabled={isPending}
								>
									<Minus className="h-4 w-4" />
								</Button>
							)}
						</div>

						<FormField
							control={form.control}
							name={`sections.${sectionIndex}.lessons.${lessonIndex}.title`}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Lesson Title</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g., Introduction to DeFi"
											{...field}
											disabled={isPending}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="space-y-2">
							<Label>Lesson Content</Label>
							<p className="text-sm text-muted-foreground">
								Use the rich text editor to create lesson content
							</p>
							<LessonEditor
								content={lesson.content}
								onChange={(data) =>
									form.setValue(
										`sections.${sectionIndex}.lessons.${lessonIndex}.content`,
										data
									)
								}
								placeholder="Start writing your lesson content..."
								isReadOnly={isPending}
							/>
						</div>
					</div>
				))}
			</div>

			<Separator />

			{/* Quiz */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h4 className="font-medium">Quiz Questions</h4>
						<p className="text-sm text-muted-foreground">
							Add quiz questions to test understanding
						</p>
					</div>
					<Button
						type="button"
						onClick={() => {
							const currentQuiz = form.getValues(
								`sections.${sectionIndex}.quiz`
							);
							form.setValue(`sections.${sectionIndex}.quiz`, [
								...currentQuiz,
								{ question: "", options: ["", "", "", ""], correctAnswer: 0 },
							]);
						}}
						variant="outline"
						size="sm"
						className="gap-2"
						disabled={isPending}
					>
						<Plus className="h-4 w-4" />
						Add Question
					</Button>
				</div>

				{watchedSection?.quiz?.map((question: any, questionIndex: number) => (
					<div
						key={questionIndex}
						className="p-4 bg-muted/30 rounded-lg space-y-4"
					>
						<div className="flex items-center justify-between">
							<Label>Question {questionIndex + 1}</Label>
							{watchedSection.quiz.length > 1 && (
								<Button
									type="button"
									onClick={() => {
										const currentQuiz = form.getValues(
											`sections.${sectionIndex}.quiz`
										);
										const newQuiz = currentQuiz.filter(
											(_: any, i: number) => i !== questionIndex
										);
										form.setValue(`sections.${sectionIndex}.quiz`, newQuiz);
									}}
									variant="ghost"
									size="sm"
									className="text-destructive"
									disabled={isPending}
								>
									<Minus className="h-4 w-4" />
								</Button>
							)}
						</div>

												<FormField
							control={form.control}
							name={`sections.${sectionIndex}.quiz.${questionIndex}.question`}
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input placeholder="Enter your question" {...field} disabled={isPending} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="space-y-3">
							<Label className="text-sm font-medium">Answer Options</Label>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{[0, 1, 2, 3].map((optionIndex) => (
									<div
										key={optionIndex}
										className="flex items-center space-x-2"
									>
										<Input
											type="radio"
											checked={question.correctAnswer === optionIndex}
											onChange={() =>
												form.setValue(
													`sections.${sectionIndex}.quiz.${questionIndex}.correctAnswer`,
													optionIndex
												)
											}
											className="size-3"
											disabled={isPending}
										/>
										<FormField
											control={form.control}
											name={`sections.${sectionIndex}.quiz.${questionIndex}.options.${optionIndex}`}
											render={({ field }) => (
												<FormItem className="flex-1">
													<FormControl>
																												<Input
											placeholder={`Option ${optionIndex + 1}`}
											{...field}
											disabled={isPending}
										/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>
								))}
							</div>
							<div className="text-sm text-muted-foreground">
								Select the radio button next to the correct answer
							</div>
						</div>
					</div>
				))}
			</div>
			
		</div>
	);
};

export default SectionContent;
