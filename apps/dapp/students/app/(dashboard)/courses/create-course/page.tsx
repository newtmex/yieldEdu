"use client";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, ArrowLeft, Eye, LoaderCircle } from "lucide-react";
import deepEqual from "fast-deep-equal";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import CoursePreview from "@/components/course-preview";
import { courseSchema } from "@/lib/react-hook-form";
import { TooltipInfo } from "@/components/tooltip-info";
import { authClient } from "@/lib/auth-client";
import featuredCourseImage from "@/public/featured-course.svg";
import SectionContent from "@/components/course-section-content";
import { useEffect, useState, useTransition } from "react";
import { supabase } from "@/lib/supabase";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";

export type CourseFormData = z.infer<typeof courseSchema>;

const CourseCreation = () => {
	const router = useRouter();
	const { data: session } = authClient.useSession();
	const [isPending, startTransition] = useTransition();
	const searchParams = useSearchParams();
	const courseId = searchParams.get("id");
	const isEditMode = !!courseId;
	const LOCAL_STORAGE_KEY = courseId
		? `course_draft_${courseId}`
		: "course_draft";

	const [showDraftModal, setShowDraftModal] = useState(false);
	const [pendingCourseData, setPendingCourseData] = useState<any | null>(null);
	const [draftData, setDraftData] = useState<any | null>(null);
	const [hasChanges, setHasChanges] = useState(false);
	const [initialData, setInitialData] = useState<CourseFormData | null>(null);
	const [isFromDraft, setIsFromDraft] = useState(false);

	const form = useForm<CourseFormData>({
		resolver: zodResolver(courseSchema) as any,
		defaultValues: {
			title: "",
			description: "",
			longDescription: "",
			category: "",
			difficulty: "Beginner",
			whatYouWillLearn: [""],
			sections: [
				{
					title: "",
					chapters: 1,
					lessons: [{ title: "", content: null, isPreview: false }],
					quiz: [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }],
				},
			],
		},
	});

	useEffect(() => {
		const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);

		if (!isEditMode && savedDraft) {
			try {
				const parsed = JSON.parse(savedDraft);
				const isMeaningful =
					parsed.title?.trim() ||
					parsed.description?.trim() ||
					parsed.longDescription?.trim() ||
					(parsed.sections?.length > 0 && parsed.sections[0].title?.trim()) ||
					(parsed.whatYouWillLearn?.length > 0 &&
						parsed.whatYouWillLearn.some((item: string) => item.trim() !== ""));

				if (!isMeaningful) return;

				form.reset(parsed);
				setIsFromDraft(true);
				setInitialData(parsed);
			} catch (err) {
				console.error("Failed to parse saved draft", err);
				toast.error("Failed to parse saved draft");
			}
		}

		if (isEditMode) {
			const fetchData = async () => {
				const { data } = await supabase
					.from("courses")
					.select(`*, sections(*, lessons(*), quizzes(*))`)
					.eq("id", courseId)
					.maybeSingle();

				if (data) {
					const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
					if (savedDraft) {
						try {
							const parsedDraft = JSON.parse(savedDraft);
							// A simple check to see if the draft has any meaningful data
							const isMeaningful =
								parsedDraft.title?.trim() ||
								parsedDraft.description?.trim() ||
								parsedDraft.longDescription?.trim();

							if (isMeaningful) {
								setPendingCourseData(data);
								setDraftData(parsedDraft);
								setInitialData(parsedDraft);
								setShowDraftModal(true); // trigger modal
								return;
							}
						} catch (e) {
							console.error("Invalid draft in edit mode, ignoring.", e);
						}
					}

					// No draft, or invalid draft, so load from DB
					const normalized = {
						title: data.title || "",
						description: data.description || "",
						longDescription: data.long_description || "",
						category: data.category || "",
						difficulty: data.difficulty || "Beginner",
						whatYouWillLearn: data.learning_outcomes || [""],
						sections: (data.sections || []).map(
							(section: {
								title: string;
								chapter_number: number;
								lessons: any[];
								quizzes: any[];
							}) => ({
								title: section.title,
								chapters: section.chapter_number,
								lessons: (section.lessons || []).map(
									(lesson: {
										title: string;
										content: any;
										is_preview: boolean;
									}) => ({
										title: lesson.title,
										content: lesson.content,
										isPreview: lesson.is_preview,
									})
								),
								quiz: (section.quizzes || []).map(
									(q: {
										question: string;
										options: string[];
										correct_answer: number;
									}) => ({
										question: q.question,
										options: q.options,
										correctAnswer: q.correct_answer,
									})
								),
							})
						),
					};
					form.reset(normalized);
					setInitialData(normalized);
					setIsFromDraft(false); //  from DB
				}
			};

			fetchData();
		}
	}, [isEditMode, courseId, form]);

	const sectionArrays = useFieldArray({
		control: form.control,
		name: "sections",
	});

	const watchedData = form.watch();

	const formDataWithUser = {
		...watchedData,
		instructor: {
			name: session?.user.name,
			avatar: session?.user.image,
		},
		imageUrl: featuredCourseImage,
	};

	const onSubmit = async (data: CourseFormData) => {
		startTransition(async () => {
			const processedData = {
				imageUrl: featuredCourseImage,
				...data,
				sections: data.sections.map((section) => ({
					...section,
					chapters: section.lessons.length,
				})),
				instructor: {
					name: session?.user.name,
					avatar: session?.user.image,
				},
			};

			try {
				if (isEditMode) {
					// Update existing course
					const { data: course, error: courseError } = await supabase
						.from("courses")
						.update({
							title: processedData.title,
							description: processedData.description,
							long_description: processedData.longDescription,
							category: processedData.category,
							difficulty: processedData.difficulty,
							image_url: processedData.imageUrl.src,
							instructor_name: processedData.instructor.name,
							instructor_avatar: processedData.instructor.avatar,
							learning_outcomes: processedData.whatYouWillLearn,
						})
						.eq("id", courseId)
						.select()
						.single();

					if (courseError) throw courseError;

					// Delete old sections, lessons, and quizzes
					await supabase.from("sections").delete().eq("course_id", course.id);

					// Insert updated sections, lessons, and quizzes
					for (const section of processedData.sections) {
						const { data: newSection, error: sectionError } = await supabase
							.from("sections")
							.insert([
								{
									course_id: course.id,
									title: section.title,
									chapter_number: section.chapters,
								},
							])
							.select()
							.single();

						if (sectionError) throw sectionError;

						for (const lesson of section.lessons) {
							await supabase.from("lessons").insert([
								{
									section_id: newSection.id,
									title: lesson.title,
									is_preview: lesson.isPreview,
									content: lesson.content,
									type: "lesson",
								},
							]);
						}

						for (const quiz of section.quiz) {
							await supabase.from("quizzes").insert([
								{
									section_id: newSection.id,
									question: quiz.question,
									options: quiz.options,
									correct_answer: quiz.correctAnswer,
								},
							]);
						}
					}
					localStorage.removeItem(LOCAL_STORAGE_KEY);
					toast.success("Course updated successfully!");
					router.push(`/courses/manage-course`);
				} else {
					// Create new course
					const { data: existingCourse } = await supabase
						.from("courses")
						.select("id")
						.eq("title", processedData.title)
						.eq("instructor_name", processedData.instructor.name)
						.maybeSingle();

					if (existingCourse) {
						toast.error("You've already created a course with this title.");
						return;
					}

					const { data: course, error: courseError } = await supabase
						.from("courses")
						.insert([
							{
								title: processedData.title,
								description: processedData.description,
								long_description: processedData.longDescription,
								category: processedData.category,
								difficulty: processedData.difficulty,
								image_url: processedData.imageUrl.src,
								instructor_name: processedData.instructor.name,
								instructor_avatar: processedData.instructor.avatar,
								learning_outcomes: processedData.whatYouWillLearn,
							},
						])
						.select()
						.single();

					if (courseError) throw courseError;

					for (const section of processedData.sections) {
						const { data: newSection, error: sectionError } = await supabase
							.from("sections")
							.insert([
								{
									course_id: course.id,
									title: section.title,
									chapter_number: section.chapters,
								},
							])
							.select()
							.single();

						if (sectionError) throw sectionError;

						for (const lesson of section.lessons) {
							await supabase.from("lessons").insert([
								{
									section_id: newSection.id,
									title: lesson.title,
									is_preview: lesson.isPreview,
									content: lesson.content,
									type: "lesson",
								},
							]);
						}

						for (const quiz of section.quiz) {
							await supabase.from("quizzes").insert([
								{
									section_id: newSection.id,
									question: quiz.question,
									options: quiz.options,
									correct_answer: quiz.correctAnswer,
								},
							]);
						}
					}
					form.reset();
					localStorage.removeItem(LOCAL_STORAGE_KEY);
					toast.success("Course created successfully!", {
						description: `your course has been created with id ${course.id}`,
					});
					router.push(`/courses/manage-course`);
				}
			} catch (error: any) {
				console.error("Operation failed:", error.message || error);
				toast.error("Operation failed:", error.message || error);
			}
		});
	};

	// Always auto-save to localStorage
	useEffect(() => {
		if (!isFromDraft && isEditMode) return;
		const subscription = form.watch((current) => {
			localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
		});
		return () => subscription.unsubscribe();
	}, [form, LOCAL_STORAGE_KEY]);

	// Only compare to initialData for "unsaved changes" detection
	useEffect(() => {
		if (!initialData) return;

		const subscription = form.watch((current) => {
			const changed = !deepEqual(current, initialData);
			setHasChanges(changed);
		});

		return () => subscription.unsubscribe();
	}, [form, initialData]);

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8 max-w-4xl">
				<div className="flex flex-wrap gap-4 items-center justify-between mb-8">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.push("/courses")}
					>
						<ArrowLeft className="size-5" />
					</Button>
					<div className="flex gap-4 flex-wrap items-center justify-between w-full">
						<div className="flex lg:mr-auto items-center gap-4">
							<div className="mr-auto">
								<h1 className="text-xl lg:text-3xl font-bold">
									{isEditMode ? "Update Course" : "Create New Course"}
								</h1>
								<p className="text-sm text-muted-foreground">
									Design your course content and structure
								</p>
							</div>
						</div>
						<Button
							onClick={form.handleSubmit(onSubmit)}
							disabled={isPending || (isEditMode && !hasChanges)}
						>
							{isPending && <LoaderCircle className="animate-spin" size={16} />}
							{isPending
								? "Saving..."
								: isEditMode && !isFromDraft
									? "Update Course"
									: "Save Course"}
						</Button>
					</div>
				</div>

				<Tabs defaultValue="create" className="space-y-6">
					<TabsList className="grid w-full grid-cols-2 sticky top-12 z-10">
						<TabsTrigger value="create" className="gap-2">
							<Plus className="h-4 w-4" />

							{isEditMode ? "Course Update" : "Create Course"}
						</TabsTrigger>
						<TabsTrigger value="preview" className="gap-2">
							<Eye className="h-4 w-4" />
							Preview
						</TabsTrigger>
						{hasChanges && <Badge>Draft saved</Badge>}
					</TabsList>

					<TabsContent value="create" className="space-y-6">
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-6"
							>
								{/* Basic Course Information */}
								<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
									<Card>
										<CardHeader>
											<CardTitle>Basic Information</CardTitle>
										</CardHeader>
										<CardContent className="space-y-6">
											<FormField
												control={form.control}
												name="title"
												render={({ field }) => (
													<FormItem>
														<FormLabel>
															Course Title{" "}
															<span className="text-destructive">*</span>
															<TooltipInfo
																className="text-muted-foreground hidden md:flex"
																content="The main title that will appear on your course page and in search results"
															/>
														</FormLabel>

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

											<FormField
												control={form.control}
												name="description"
												render={({ field }) => (
													<FormItem>
														<FormLabel>
															Short Description{" "}
															<span className="text-destructive">*</span>
															<TooltipInfo
																className="text-muted-foreground hidden md:flex"
																content="A brief overview that appears in course listings and search results"
															/>
														</FormLabel>
														<FormControl>
															<Textarea
																placeholder="Brief overview of the course..."
																rows={3}
																{...field}
																disabled={isPending}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											<FormField
												control={form.control}
												name="longDescription"
												render={({ field }) => (
													<FormItem>
														<FormLabel>
															Long Description{" "}
															<span className="text-destructive">*</span>
															<TooltipInfo
																className="text-muted-foreground hidden md:flex"
																content="Detailed description shown on the course page to help students understand what they'll get"
															/>
														</FormLabel>
														<FormControl>
															<Textarea
																placeholder="Detailed description of the course content, objectives, and outcomes..."
																rows={6}
																{...field}
																disabled={isPending}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>

											{/* What You Will Learn */}
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<FormField
													control={form.control}
													name="category"
													render={({ field }) => (
														<FormItem>
															<FormLabel>
																Category{" "}
																<span className="text-destructive">*</span>
																<TooltipInfo
																	className="text-muted-foreground hidden md:flex"
																	content="Course category for organization and discovery"
																/>
															</FormLabel>

															<FormControl>
																<Input placeholder="Finance" {...field} />
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
												<FormField
													control={form.control}
													name="difficulty"
													render={({ field }) => (
														<FormItem>
															<FormLabel>
																Difficulty{" "}
																<span className="text-destructive">*</span>
																<TooltipInfo
																	className="text-muted-foreground hidden md:flex"
																	content="Difficulty level helps students choose appropriate courses"
																/>
															</FormLabel>
															<Select
																onValueChange={field.onChange}
																defaultValue={field.value}
																disabled={isPending}
															>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue placeholder="Select difficulty level" />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	<SelectItem value="Beginner">
																		Beginner
																	</SelectItem>
																	<SelectItem value="Intermediate">
																		Intermediate
																	</SelectItem>
																	<SelectItem value="Advanced">
																		Advanced
																	</SelectItem>
																</SelectContent>
															</Select>
															<FormMessage />
														</FormItem>
													)}
												/>
											</div>
											<div className="space-y-4">
												<div className="flex items-center justify-between">
													<Label>
														What You Will Learn{" "}
														<span className="text-destructive">*</span>
														<TooltipInfo
															className="text-muted-foreground hidden md:flex"
															content="Key takeaways and skills students will gain - these appear as bullet points on your course page"
														/>
													</Label>
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => {
															const currentItems =
																form.getValues("whatYouWillLearn");
															form.setValue("whatYouWillLearn", [
																...currentItems,
																"",
															]);
														}}
														className="gap-2"
														disabled={isPending}
													>
														<Plus className="h-4 w-4" />
														Add Item
													</Button>
												</div>
												{watchedData.whatYouWillLearn.map((_, index) => (
													<div key={index} className="flex gap-2">
														<FormField
															control={form.control}
															name={`whatYouWillLearn.${index}`}
															render={({ field }) => (
																<FormItem className="flex-1">
																	<FormControl>
																		<Input
																			placeholder="e.g., Understand blockchain fundamentals"
																			{...field}
																			disabled={isPending}
																		/>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>
														{watchedData.whatYouWillLearn.length > 1 && (
															<Button
																type="button"
																variant="ghost"
																size="sm"
																onClick={() => {
																	const currentItems =
																		form.getValues("whatYouWillLearn");
																	const newItems = currentItems.filter(
																		(_, i) => i !== index
																	);
																	form.setValue("whatYouWillLearn", newItems);
																}}
																className="text-destructive"
															>
																<Minus className="h-4 w-4" />
															</Button>
														)}
													</div>
												))}
											</div>
										</CardContent>
									</Card>
								</div>

								{/* Course Sections */}
								<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
									<Card>
										<CardHeader>
											<div className="flex items-center justify-between">
												<div>
													<CardTitle>Course Content</CardTitle>
													<p className="text-sm text-muted-foreground mt-1">
														Organize your course into sections with lessons and
														quizzes
													</p>
												</div>
												<Button
													type="button"
													onClick={() =>
														sectionArrays.append({
															title: "",
															lessons: [
																{ title: "", content: null, isPreview: false },
															],
															chapters: 1,
															quiz: [
																{
																	question: "",
																	options: ["", "", "", ""],
																	correctAnswer: 0,
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
											{sectionArrays.fields.map((section, sectionIndex) => (
												<div
													key={section.id}
													className="border rounded-lg p-6 space-y-4"
												>
													<div className="flex items-center justify-between">
														<Badge variant="secondary">
															Section {sectionIndex + 1}
														</Badge>
														{sectionArrays.fields.length > 1 && (
															<Button
																type="button"
																onClick={() =>
																	sectionArrays.remove(sectionIndex)
																}
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
																			placeholder="e.g., What is DeFi?"
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
														onSubmit={onSubmit}
														isPending={isPending}
													/>
												</div>
											))}
										</CardContent>
									</Card>
								</div>

								<div className="flex justify-end">
									<Button
										type="submit"
										disabled={isPending || (isEditMode && !hasChanges)}
									>
										{isPending && (
											<LoaderCircle className="animate-spin" size={16} />
										)}
										{isPending
											? "Saving..."
											: isEditMode && !isFromDraft
												? "Update Course"
												: "Save Course"}
									</Button>
								</div>
							</form>
						</Form>
					</TabsContent>

					<TabsContent value="preview">
						<CoursePreview courseData={formDataWithUser} />
					</TabsContent>
				</Tabs>
			</div>

			{showDraftModal && (
				<Dialog open={true}>
					<DialogContent>
						<DialogTitle>Continue with Draft?</DialogTitle>
						<DialogDescription>
							A saved draft exists. Do you want to continue with your draft or
							load the version from the database?
						</DialogDescription>
						<div className="flex justify-end gap-2 mt-4">
							<Button
								variant="outline"
								onClick={() => {
									const normalized = {
										title: pendingCourseData.title || "",
										description: pendingCourseData.description || "",
										longDescription: pendingCourseData.long_description || "",
										category: pendingCourseData.category || "",
										difficulty: pendingCourseData.difficulty || "Beginner",
										whatYouWillLearn: pendingCourseData.learning_outcomes || [
											"",
										],
										sections: (pendingCourseData.sections || []).map(
											(section: {
												title: string;
												chapter_number: number;
												lessons: any[];
												quizzes: any[];
											}) => ({
												title: section.title,
												chapters: section.chapter_number,
												lessons: (section.lessons || []).map(
													(lesson: {
														title: string;
														content: any;
														is_preview: boolean;
													}) => ({
														title: lesson.title,
														content: lesson.content,
														isPreview: lesson.is_preview,
													})
												),
												quiz: (section.quizzes || []).map(
													(q: {
														question: string;
														options: string[];
														correct_answer: number;
													}) => ({
														question: q.question,
														options: q.options,
														correctAnswer: q.correct_answer,
													})
												),
											})
										),
									};

									form.reset(normalized);
									localStorage.removeItem(LOCAL_STORAGE_KEY);
									setShowDraftModal(false);
								}}
							>
								Discard Draft
							</Button>
							<Button
								onClick={() => {
									form.reset(draftData);
									setShowDraftModal(false);
								}}
							>
								Continue with Draft
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
};

export default CourseCreation;
