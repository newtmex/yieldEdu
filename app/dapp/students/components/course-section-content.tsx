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
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: `sections.${sectionIndex}.lessons`,
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
							append({
								title: "",
								content: null,
								isPreview: false,
							});
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

				{fields.map((lesson, lessonIndex) => (
					<div key={lesson.id} className="p-4 bg-muted/50 rounded-lg space-y-4">
						<div className="flex items-center justify-between">
							<Badge variant="outline">Lesson {lessonIndex + 1}</Badge>
							{fields.length > 1 && (
								<Button
									disabled={isPending}
									type="button"
									onClick={() => remove(lessonIndex)}
									variant="ghost"
									size="sm"
									className="text-destructive"
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
							<Controller
								name={`sections.${sectionIndex}.lessons.${lessonIndex}.content`}
								control={form.control}
								render={({ field }) => (
									<LessonEditor
										content={field.value}
										onChange={field.onChange}
										placeholder="Start writing your lesson content..."
										isReadOnly={isPending}
									/>
								)}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default SectionContent;
