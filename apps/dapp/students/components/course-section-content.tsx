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
import { useFieldArray, Controller } from "react-hook-form";

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
											placeholder="e.g., What is DeFi?"
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
		</div>
	);
};

export default SectionContent;
