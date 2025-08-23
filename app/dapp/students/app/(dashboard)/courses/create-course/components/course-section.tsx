import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import SectionContent from "@/components/course-section-content";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { CourseFormData } from "../page";

const CourseSection = ({
	form,
	isPending,
}: {
	form: UseFormReturn<CourseFormData>;
	isPending: boolean;
}) => {
	const sectionArrays = useFieldArray({
		control: form.control,
		name: "sections",
	});

	return (
		<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Course Content</CardTitle>
							<p className="text-sm text-muted-foreground mt-1">
								Organize your course into sections with lessons
							</p>
							{form.formState.errors.sections?.root?.message && (
								<p className="text-sm text-destructive">
									{form.formState.errors.sections.root.message}
								</p>
							)}
						</div>
						<Button
							type="button"
							onClick={() =>
								sectionArrays.append({
									title: "",
									chapters: 1,
									lessons: [
										{
											title: "",
											content: null,
											isPreview: false,
										},
									],
								})
							}
							variant="outline"
							size="sm"
							className="gap-2"
							disabled={isPending}
						>
							<Plus className="h-4 w-4" />
							Add Section
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					{sectionArrays.fields?.map((section, sectionIndex) => (
						<div key={section.id} className="border rounded-lg p-6 space-y-4">
							<div className="flex items-center justify-between">
								<Badge variant="secondary">Section {sectionIndex + 1}</Badge>
								{sectionArrays.fields.length > 1 && (
									<Button
										disabled={isPending}
										type="button"
										onClick={() => sectionArrays.remove(sectionIndex)}
										variant="ghost"
										size="sm"
										className="text-destructive"
									>
										<Minus className="h-4 w-4" />
									</Button>
								)}
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name={`sections.${sectionIndex}.title`}
									render={({ field }) => (
										<FormItem>
											<FormLabel>Section Title</FormLabel>
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
							</div>

							<Separator />
							<SectionContent
								sectionIndex={sectionIndex}
								form={form}
								isPending={isPending}
							/>
						</div>
					))}
				</CardContent>
				<Button
					type="button"
					onClick={() =>
						sectionArrays.append({
							title: "",
							chapters: 1,
							lessons: [
								{
									title: "",
									content: null,
									isPreview: false,
								},
							],
						})
					}
					variant="default"
					size="sm"
					className="gap-2 w-fit mx-auto"
					disabled={isPending}
				>
					<Plus className="h-4 w-4" />
					Add Another Section
				</Button>
			</Card>
		</div>
	);
};

export default CourseSection;
