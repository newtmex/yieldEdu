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
import { useQueryClient } from "@tanstack/react-query";
import { useAppKitAccount } from "@reown/appkit/react";
import QuizCreation from "@/components/quiz-creation";
import Loading from "@/app/loading";
import { useCoursePermissions } from "@/hooks/course";
import { UserRoles } from "@/lib/permissions";

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
	const [draftData, setDraftData] = useState<any | null>(null);
	const [hasChanges, setHasChanges] = useState(false);
	const [initialData, setInitialData] = useState<CourseFormData | null>(null);
	const [isFromDraft, setIsFromDraft] = useState(false);
	const queryClient = useQueryClient();
	const { address } = useAppKitAccount();

	const trimData = (data: CourseFormData): CourseFormData => {
		const deepClean = (obj: any): any => {
			if (Array.isArray(obj)) {
				return obj
					.map(deepClean) // clean each element
					.filter((item) => item !== undefined && item !== null && item !== "");
			}
			if (obj && typeof obj === "object") {
				const cleaned: any = {};
				for (const key in obj) {
					if (key === "time") continue; // remove volatile timestamp
					const value = deepClean(obj[key]);
					if (value !== undefined && value !== null && value !== "") {
						cleaned[key] = value;
					}
				}
				return cleaned;
			}
			if (typeof obj === "string") return obj.trim();
			return obj;
		};

		return deepClean(data);
	};

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
					lessons: [
						{
							title: "",
							content: null,
							isPreview: false,
						},
					],
				},
			],
			quizzes: [
				{
					question: "",
					options: ["", "", "", ""],
					correctAnswer: 0,
				},
			],
		},
	});

	const checkMeaningfulDraft = (parsed: any) => {
		// More strict checking - only consider it meaningful if there's substantial content
		const hasTitle = (parsed.title || "").trim().length > 0;
		const hasDescription = (parsed.description || "").trim().length > 0;
		const hasLongDescription = (parsed.longDescription || "").trim().length > 0;
		const hasCategory = (parsed.category || "").trim().length > 0;

		const hasNonEmptyLearning =
			Array.isArray(parsed.whatYouWillLearn) &&
			parsed.whatYouWillLearn.some(
				(item: string) => (item || "").trim().length > 0
			);

		const hasSectionsContent =
			Array.isArray(parsed.sections) &&
			parsed.sections.some(
				(section: any) =>
					(section?.title || "").trim().length > 0 ||
					(Array.isArray(section?.lessons) &&
						section.lessons.some(
							(lesson: any) =>
								(lesson?.title || "").trim().length > 0 ||
								(lesson?.content !== null &&
									lesson?.content !== undefined &&
									JSON.stringify(lesson.content).length > 0)
						))
			);

		const hasQuizContent =
			Array.isArray(parsed.quizzes) &&
			parsed.quizzes.some(
				(q: any) =>
					(q?.question || "").trim().length > 0 ||
					(Array.isArray(q?.options) &&
						q.options.some((opt: string) => (opt || "").trim().length > 0)) // At least 2 characters
			);

		// Require at least one substantial field to be filled
		return (
			hasTitle ||
			hasDescription ||
			hasLongDescription ||
			hasCategory ||
			hasNonEmptyLearning ||
			hasSectionsContent ||
			hasQuizContent
		);
	};

	useEffect(() => {
		if (!isEditMode) {
			const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
			if (savedDraft) {
				try {
					const parsed = JSON.parse(savedDraft);
					if (checkMeaningfulDraft(parsed)) {
						setDraftData(parsed);
						setShowDraftModal(true);
					} else {
						setInitialData(JSON.parse(JSON.stringify(form.getValues())));
					}
				} catch (err) {
					console.error("Failed to parse saved draft", err);
					toast.error("Failed to parse saved draft");
					setInitialData(JSON.parse(JSON.stringify(form.getValues())));
				}
			} else {
				setInitialData(JSON.parse(JSON.stringify(form.getValues())));
			}
		}

		if (isEditMode) {
			const fetchData = async () => {
				const { data } = await supabase
					.from("courses")
					.select(`*, sections(*, lessons(*)), quizzes(*)`)
					.eq("id", courseId)
					.maybeSingle();

				if (data) {
					const normalizedDbData: CourseFormData = {
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
							})
						),
						quizzes: (data.quizzes || []).map(
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
					};

					const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
					let hasMeaningfulDraft = false;
					if (savedDraft) {
						try {
							const parsedDraft = JSON.parse(savedDraft);
							// If the draft differs from the DB-normalized data, present the modal.
							const draftDiffersFromDb = !deepEqual(
								parsedDraft,
								normalizedDbData
							);
							if (draftDiffersFromDb) {
								hasMeaningfulDraft = true;
								setDraftData(parsedDraft);
								setInitialData(JSON.parse(JSON.stringify(normalizedDbData))); // DB remains the discard target
								setIsFromDraft(true);
								setShowDraftModal(true);
							}
						} catch (e) {
							console.error("Invalid draft in edit mode, ignoring.", e);
						}
					}

					if (!hasMeaningfulDraft) {
						// No draft, or invalid draft, so load DB now
						form.reset(normalizedDbData);
						setInitialData(JSON.parse(JSON.stringify(normalizedDbData)));
						setIsFromDraft(false);
					}
				}
			};

			fetchData();
		}
	}, [isEditMode, courseId, form.reset, form.getValues]);

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
			const trimmedData = trimData(data);
			const processedData = {
				imageUrl: featuredCourseImage,
				...trimmedData,
				sections: trimmedData.sections.map((section) => ({
					...section,
					chapters: section.lessons.length,
					lessons: section.lessons.map((lesson) => ({
						...lesson,
					})),
				})),
				instructor: {
					name: session?.user.name,
					avatar: session?.user.image,
					user_id: session?.user.id,
				},
			};

			if (!processedData.instructor) {
				toast.error("You are not authenticated");
				return;
			}

			if (!address) {
				toast.error("Connect your wallet", {
					description: "We need your address to create a course",
				});
				return;
			}

			try {
				if (isEditMode) {
					// Update existing course
					const { data: courseUpdate, error: courseUpdateError } =
						await supabase
							.from("courses")
							.update({
								title: processedData.title,
								description: processedData.description,
								long_description: processedData.longDescription,
								category: processedData.category,
								difficulty: processedData.difficulty,
								instructor_name: processedData.instructor.name,
								instructor_avatar: processedData.instructor.avatar,
								learning_outcomes: processedData.whatYouWillLearn,
							})
							.eq("id", courseId)
							.select()
							.single();

					if (courseUpdateError) throw courseUpdateError;

					// Delete old sections, lessons, and quizzes
					await supabase
						.from("quizzes")
						.delete()
						.eq("course_id", courseUpdate.id);
					await supabase
						.from("lessons")
						.delete()
						.eq("course_id", courseUpdate.id);

					await supabase
						.from("sections")
						.delete()
						.eq("course_id", courseUpdate.id);

					// Insert updated sections, lessons, and quizzes
					for (const section of processedData.sections) {
						const { data: newSection, error: sectionError } = await supabase
							.from("sections")
							.insert([
								{
									course_id: courseUpdate.id,
									title: section.title,
									chapter_number: section.chapters,
								},
							])
							.select()
							.single();

						if (sectionError) throw sectionError;

						for (const lesson of section.lessons) {
							const { error: lessonError } = await supabase
								.from("lessons")
								.insert([
									{
										section_id: newSection.id,
										title: lesson.title,
										is_preview: lesson.isPreview,
										content: lesson.content,
										type: "lesson",
									},
								])
								.select()
								.single();

							if (lessonError) throw lessonError;
						}
					}
					for (const quiz of processedData.quizzes) {
						const { error: quizError } = await supabase.from("quizzes").insert([
							{
								course_id: courseUpdate.id,
								question: quiz.question,
								options: quiz.options,
								correct_answer: quiz.correctAnswer,
							},
						]);
						if (quizError) throw quizError;
					}
					toast.success("Course updated successfully!");
					localStorage.removeItem(LOCAL_STORAGE_KEY);
					queryClient.invalidateQueries({ queryKey: ["manage-courses"] });
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
						localStorage.removeItem(LOCAL_STORAGE_KEY);
						return; // Stop execution if course exists
					}

					const { data: course, error: courseError } = await supabase
						.from("courses")
						.insert([
							{
								user_id: processedData.instructor.user_id,
								title: processedData.title,
								description: processedData.description,
								long_description: processedData.longDescription,
								category: processedData.category,
								difficulty: processedData.difficulty,
								instructor_name: processedData.instructor.name,
								instructor_avatar: processedData.instructor.avatar,
								learning_outcomes: processedData.whatYouWillLearn,
							},
						])
						.select()
						.single();

					if (courseError) throw courseError;

					// Now that course is created, insert sections, lessons, and quizzes
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
							const { error: lessonError } = await supabase
								.from("lessons")
								.insert([
									{
										course_id: course.id,
										section_id: newSection.id,
										title: lesson.title,
										is_preview: lesson.isPreview,
										content: lesson.content,
										type: "lesson",
									},
								])
								.select()
								.single();

							if (lessonError) throw lessonError;
						}
					}
					// Insert quizzes for the course
					for (const quiz of processedData.quizzes) {
						const { error: quizError } = await supabase.from("quizzes").insert([
							{
								course_id: course.id,
								question: quiz.question,
								options: quiz.options,
								correct_answer: quiz.correctAnswer,
							},
						]);
						if (quizError) throw quizError;
					}
					form.reset();
					localStorage.removeItem(LOCAL_STORAGE_KEY);
					toast.success("Course created successfully!", {
						description: `Your course has been created with id ${course.id}`,
					});
					queryClient.invalidateQueries({ queryKey: ["manage-courses"] });
					router.push(`/courses/manage-course`);
				}
			} catch (error: any) {
				console.error("Operation failed:", error.message || error);
				toast.error("Operation failed:", error.message || error);
			}
		});
	};

	function logDeepDiff(a: any, b: any, path = "") {
		if (a === b) return; // identical, no diff

		if (a === undefined || b === undefined) {
			console.log(`Diff at ${path || "root"}:`, { a, b });
			return;
		}

		if (
			typeof a !== "object" ||
			typeof b !== "object" ||
			a === null ||
			b === null
		) {
			console.log(`Diff at ${path || "root"}:`, { a, b });
			return;
		}

		if (Array.isArray(a) && Array.isArray(b)) {
			if (a.length !== b.length) {
				console.log(`Diff at ${path}: array length ${a.length} vs ${b.length}`);
			}
			a.forEach((item, i) => {
				logDeepDiff(item, b[i], `${path}[${i}]`);
			});
			return;
		}

		const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
		keys.forEach((key) => {
			if (!(key in a)) {
				console.log(`Diff at ${path}.${key}: key missing in first object`, {
					b: b[key],
				});
			} else if (!(key in b)) {
				console.log(`Diff at ${path}.${key}: key missing in second object`, {
					a: a[key],
				});
			} else {
				logDeepDiff(a[key], b[key], path ? `${path}.${key}` : key);
			}
		});
	}

	function customDeepEqual(a: any, b: any): boolean {
		// Same reference or primitive value
		if (a === b) return true;

		// Handle null or non-object types
		if (
			typeof a !== "object" ||
			typeof b !== "object" ||
			a === null ||
			b === null
		) {
			return false;
		}

		// Arrays
		if (Array.isArray(a) && Array.isArray(b)) {
			if (a.length !== b.length) return false;
			for (let i = 0; i < a.length; i++) {
				if (!customDeepEqual(a[i], b[i])) return false;
			}
			return true;
		}

		// If one is array and other is not
		if (Array.isArray(a) !== Array.isArray(b)) return false;

		// Objects
		const keysA = Object.keys(a).filter((k) => k !== "time"); // ignore "time" fields
		const keysB = Object.keys(b).filter((k) => k !== "time");

		if (keysA.length !== keysB.length) return false;

		// Compare keys ignoring order
		const allKeys = new Set([...keysA, ...keysB]);
		for (let key of allKeys) {
			if (!customDeepEqual(a[key], b[key])) return false;
		}

		return true;
	}

	useEffect(() => {
		if (!initialData) return;

		const subscription = form.watch(() => {
			const currentValues = trimData(form.getValues() as CourseFormData);
			const initialValues = trimData(initialData);

			const changed = !customDeepEqual(currentValues, initialValues);

			if (changed) {
				console.log("=== Diff Found ===");
				logDeepDiff(currentValues, initialValues);
				setHasChanges(true);
				localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentValues));
			} else {
				setHasChanges(false);
				localStorage.removeItem(LOCAL_STORAGE_KEY);
			}
		});

		return () => subscription.unsubscribe();
	}, [form, initialData, LOCAL_STORAGE_KEY]);

	const { errors } = form.formState;

	useEffect(() => {
		if (form.formState.isSubmitted && errors) {
			console.log(errors);
		}
	}, []);

	const {
		hasContentCreationPermissions,
		permissionsLoading,
		isPermissionPending,
	} = useCoursePermissions({
		role: session?.user.role as UserRoles,
		permissions: {
			course: ["create", "delete:own", "update:own"],
		},
	});

	if (
		hasContentCreationPermissions === null ||
		permissionsLoading ||
		isPermissionPending
	) {
		return <Loading />;
	}

	if (hasContentCreationPermissions === false) {
		router.push("/unauthorized");
	}
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
												{form.formState.errors.whatYouWillLearn?.root
													?.message && (
													<p className="text-sm text-destructive font-medium">
														{
															form.formState.errors.whatYouWillLearn.root
																.message
														}
													</p>
												)}
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

								{/* <div className="text-xs text-destructive">
									<p>
										Form errors:{" "}
										{JSON.stringify(form.formState.errors, null, 2)}
									</p>
								</div> */}
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
								<QuizCreation form={form} isPending={isPending} />
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
								onClick={() => {
									if (isEditMode) {
										form.reset(draftData); // Load draft data into the form
									} else {
										form.reset(draftData);
										setInitialData(draftData);
										setIsFromDraft(true);
									}
									setShowDraftModal(false);
								}}
							>
								Continue with Draft
							</Button>
							<Button
								variant="destructive"
								onClick={() => {
									localStorage.removeItem(LOCAL_STORAGE_KEY); // Remove first
									if (initialData) {
										form.reset(initialData); // Revert to original DB data
										setInitialData(initialData); // Ensure initialData is consistent
									} else {
										// If no initialData (new course), reset to default empty values
										form.reset();
										setInitialData(form.getValues()); // Set initialData to current form values (which are now defaults)
									}
									setIsFromDraft(false); // Explicitly set to false
									setShowDraftModal(false);
									toast.success("Draft discarded successfully!");
								}}
							>
								Discard Draft
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
};

export default CourseCreation;
