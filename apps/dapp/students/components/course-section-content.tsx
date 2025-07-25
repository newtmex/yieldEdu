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
import dynamic from "next/dynamic";
import { useFieldArray } from "react-hook-form";

const LessonEditor = dynamic(
	() => import("@/components/lesson-editor").then((mod) => mod.LessonEditor),
	{ ssr: false }
);

const SectionContent: React.FC<{
	sectionIndex: number;
	form: any;
	isPending: boolean;
}> = ({ sectionIndex, form, isPending }) => {
	const watchedSection = form.watch(`sections.${sectionIndex}`);

	const quizArrays = useFieldArray({
		control: form.control,
		name: `sections.${sectionIndex}.quizzes`,
	});

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
						<>
							{form.formState.errors.sections?.[sectionIndex]?.lessons?.root
								?.message && (
								<p className="text-sm text-destructive">
									{
										form.formState.errors.sections?.[sectionIndex]?.lessons
											?.root?.message
									}
								</p>
							)}
						</>
					</div>
					<Button
						type="button"
						onClick={() => {
							const currentLessons = form.getValues(
								`sections.${sectionIndex}.lessons`
							);
							form.setValue(`sections.${sectionIndex}.lessons`, [
								...currentLessons,
								{
									title: "",
									content: null,
									isPreview: false,
								},
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
			{/* Quizzes */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<h4 className="font-medium">Quiz Questions</h4>
						<p className="text-sm text-muted-foreground">
							Add quiz questions to test understanding
						</p>
						{form.formState.errors.sections?.[sectionIndex]?.quizzes?.root
							?.message && (
							<p className="text-sm text-destructive">
								{
									form.formState.errors.sections?.[sectionIndex]?.quizzes?.root
										?.message
								}
							</p>
						)}
					</div>
					<Button
						type="button"
						onClick={() => {
							quizArrays.append({
								question: "",
								options: ["", "", "", ""],
								correctAnswer: 0,
							});
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

				{quizArrays.fields.map((question: any, questionIndex: number) => (
					<div
						key={questionIndex}
						className="p-4 bg-muted/30 rounded-lg space-y-4"
					>
						{form.formState.errors.sections?.[sectionIndex]?.quizzes?.[
							questionIndex
						]?.options?.root?.message && (
							<p className="text-sm text-destructive">
								{
									form.formState.errors.sections?.[sectionIndex]?.quizzes?.[
										questionIndex
									]?.options?.root?.message
								}
							</p>
						)}

						{form.formState.errors.sections?.[sectionIndex]?.lessons?.[
							questionIndex
						]?.quiz?.message && (
							<p className="text-sm text-destructive font-medium">
								{
									form.formState.errors.sections[sectionIndex].lessons[
										questionIndex
									].quiz.message
								}
							</p>
						)}
						<div className="flex items-center justify-between">
							<Label>Question {questionIndex + 1}</Label>
							{quizArrays.fields.length > 1 && (
								<Button
									type="button"
									onClick={() => {
										const currentQuizzes = form.getValues(
											`sections.${sectionIndex}.quizzes`
										);
										const newQuizzes = currentQuizzes.filter(
											(_: any, i: number) => i !== questionIndex
										);
										form.setValue(
											`sections.${sectionIndex}.quizzes`,
											newQuizzes
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
							name={`sections.${sectionIndex}.quizzes.${questionIndex}.question`}
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											placeholder="Enter your question"
											{...field}
											disabled={isPending}
										/>
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
													`sections.${sectionIndex}.quizzes.${questionIndex}.correctAnswer`,
													optionIndex
												)
											}
											className="size-3"
											disabled={isPending}
										/>

										<FormField
											control={form.control}
											name={`sections.${sectionIndex}.quizzes.${questionIndex}.options.${optionIndex}`}
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
								{form.formState.errors.sections?.[sectionIndex]?.quizzes?.[
									questionIndex
								]?.options?.message && (
									<p className="text-sm text-destructive">
										{
											form.formState.errors.sections[sectionIndex]?.quizzes?.[
												questionIndex
											]?.options?.message
										}
									</p>
								)}
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
