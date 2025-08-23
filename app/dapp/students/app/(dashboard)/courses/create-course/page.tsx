"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";

import { Plus, ArrowLeft, Eye, LoaderCircle } from "lucide-react";
import deepEqual from "fast-deep-equal";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import CoursePreview from "@/components/course-preview";
import { courseSchema } from "@/lib/react-hook-form";
import { authClient } from "@/lib/auth-client";
import featuredCourseImage from "@/public/featured-course.svg";
import { useEffect, useState, useTransition } from "react";
import { supabase } from "@/lib/supabase";
import { debounce } from "lodash";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppKitAccount } from "@reown/appkit/react";
import QuizCreation from "@/components/quiz-creation";
import Loading from "@/app/loading";
import { useCoursePermissions } from "@/hooks/course";
import { UserRoles } from "@/lib/permissions";
import LoadingScreen from "@/components/loading-screen";
import BasicCourseInfo from "./components/basic-course-info";
import RewardSettings from "./components/reward-settings";
import CourseSection from "./components/course-section";
import {
	checkMeaningfulDraft,
	customDeepEqual,
	logDeepDiff,
	trimData,
} from "@/helpers/course-creation";
import DraftModal from "./components/draft-modal";
import ValidationHelp from "./components/validation-helper";
export type CourseFormData = z.infer<typeof courseSchema>;

const Page = () => {
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

	const {
		data: courseData,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["modify_course", courseId],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("courses")
				.select(`*, sections(*, lessons(*)), quizzes(*)`)
				.eq("id", courseId)
				.maybeSingle();

			if (error) {
				throw new Error(error.message);
			}

			if (!data) {
				return null;
			}

			// Normalize the data
			const normalizedDbData: CourseFormData = {
				title: data.title || "",
				description: data.description || "",
				longDescription: data.long_description || "",
				category: data.category || "",
				difficulty: data.difficulty || "Beginner",
				whatYouWillLearn: data.learning_outcomes || [""],
				sections: (data.sections || [])?.map(
					(section: {
						title: string;
						chapter_number: number;
						lessons: any[];
					}) => ({
						title: section.title,
						chapters: section.chapter_number,
						lessons: (section.lessons || [])?.map(
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
				quizzes: (data.quizzes || [])?.map(
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
				// rewards: {
				// 	enabled: data.rewards?.enabled || false,
				// 	pointsPerLesson: data.rewards?.pointsPerLesson || 5,
				// 	pointsPerQuizAnswer: data.rewards?.pointsPerQuizAnswer || 5,
				// 	maxCoursePoints: data.rewards?.maxCoursePoints || 30,
				// },
			};

			return normalizedDbData;
		},
		enabled: isEditMode && !!courseId, // Only fetch when in edit mode and courseId exists
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 2,
	});

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
			// rewards: {
			// 	enabled: false,
			// 	pointsPerLesson: 5,
			// 	pointsPerQuizAnswer: 5,
			// 	maxCoursePoints: 30,
			// },
		},
	});

	const clearOldDrafts = () => {
		try {
			const keys = Object.keys(localStorage);
			const draftKeys = keys.filter(
				(key) => key.startsWith("course_draft_") && key !== LOCAL_STORAGE_KEY
			);

			draftKeys.forEach((key) => localStorage.removeItem(key));
			console.log(`Cleared ${draftKeys.length} old drafts`);
		} catch (error) {
			console.error("Failed to clear old drafts:", error);
		}
	};

	// Handle non-edit mode (draft loading)
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
	}, [isEditMode, form.getValues]);

	// Handle course data when it's available (edit mode)
	useEffect(() => {
		if (!isEditMode || !courseData) return;

		const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
		let hasMeaningfulDraft = false;

		if (savedDraft) {
			try {
				const parsedDraft = JSON.parse(savedDraft);
				const draftDiffersFromDb = !deepEqual(parsedDraft, courseData);

				if (draftDiffersFromDb) {
					hasMeaningfulDraft = true;
					setDraftData(parsedDraft);
					setInitialData(JSON.parse(JSON.stringify(courseData)));
					setIsFromDraft(true);
					setShowDraftModal(true);
				}
			} catch (e) {
				console.error("Invalid draft in edit mode, ignoring.", e);
			}
		}

		if (!hasMeaningfulDraft) {
			// No draft, or invalid draft, so load DB data now
			form.reset(courseData);
			setInitialData(JSON.parse(JSON.stringify(courseData)));
			setIsFromDraft(false);
		}
	}, [courseData, isEditMode, form.reset]);

	// Handle loading and error states
	useEffect(() => {
		if (isEditMode && isError) {
			toast.error("An error occurred", {
				description:
					error?.message || "Something went wrong fetching the data.",
			});
			console.error(error);
		}
	}, [isEditMode, isError, error]);

	useEffect(() => {
		if (!initialData) return;

		const debouncedSave = debounce((currentValues: CourseFormData) => {
			try {
				const serialized = JSON.stringify(currentValues);
				const sizeInBytes = new Blob([serialized]).size;
				const sizeInMB = sizeInBytes / (1024 * 1024);

				if (sizeInMB > 4) {
					toast.warning("Content too large to auto-save");
					return;
				}

				localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
			} catch (error: any) {
				if (error.name === "QuotaExceededError") {
					toast.error("Storage full. Please save to server.");
					clearOldDrafts();
				}
			}
		}, 1000); // Save after 1 second of inactivity
		const subscription = form.watch(() => {
			const currentValues = trimData(form.getValues() as CourseFormData);
			const initialValues = trimData(initialData);

			const changed = !customDeepEqual(currentValues, initialValues);

			if (changed) {
				console.log("=== Diff Found ===");
				logDeepDiff(currentValues, initialValues);
				setHasChanges(true);
				debouncedSave(currentValues);

				try {
					const serialized = JSON.stringify(currentValues);
					const sizeInBytes = new Blob([serialized]).size;
					const sizeInMB = sizeInBytes / (1024 * 1024);

					if (sizeInMB > 4) {
						// Keep under 4MB
						console.warn(`Draft too large: ${sizeInMB.toFixed(2)}MB`);
						toast.warning("Contents too large to auto-save");
						return;
					}

					localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
				} catch (error: any) {
					if (error.name === "QuotaExceededError") {
						console.error("Storage quota exceeded");
						toast.error("Storage full. Please save your work to the server.");
						// Optionally clear old drafts
						clearOldDrafts();
					}
				}
			} else {
				setHasChanges(false);
				localStorage.removeItem(LOCAL_STORAGE_KEY);
				debouncedSave.cancel();
			}
		});

		return () => {
			subscription.unsubscribe();
			debouncedSave.cancel();
		};
	}, [form, initialData, LOCAL_STORAGE_KEY]);

	const { errors } = form.formState;

	useEffect(() => {
		if (form.formState.isSubmitted && errors) {
			console.log(errors);
		}
	}, []);

	useEffect(() => {
		if (hasContentCreationPermissions === false) {
			router.push("/unauthorized");
		}
	}, [hasContentCreationPermissions]);

	// In your JSX, you can show loading state:
	if (isEditMode && isLoading) {
		return <LoadingScreen text="Loading course data..." />; // or your loading component
	}

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
				sections: trimmedData.sections?.map((section) => ({
					...section,
					chapters: section.lessons.length,
					lessons: section.lessons?.map((lesson) => ({
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
								// rewards: {
								// 	enabled: processedData.rewards.enabled,
								// 	pointsPerLesson: processedData.rewards.pointsPerLesson,
								// 	pointsPerQuizAnswer:
								// 		processedData.rewards.pointsPerQuizAnswer,
								// 	maxCoursePoints: processedData.rewards.maxCoursePoints,
								// },
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
								// rewards: {
								// 	enabled: processedData.rewards.enabled,
								// 	pointsPerLesson: processedData.rewards.pointsPerLesson,
								// 	pointsPerQuizAnswer:
								// 		processedData.rewards.pointsPerQuizAnswer,
								// 	maxCoursePoints: processedData.rewards.maxCoursePoints,
								// },
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

	if (
		hasContentCreationPermissions === null ||
		permissionsLoading ||
		isPermissionPending
	) {
		return <Loading />;
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
								<BasicCourseInfo
									form={form}
									isPending={isPending}
									watchedData={watchedData}
								/>

								{/* Reward Settings */}
								<RewardSettings
									isPending={isPending}
									form={form}
									watchedData={watchedData}
								/>

								{/* Course Sections */}

								<CourseSection isPending={isPending} form={form} />
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
			<ValidationHelp errors={form.formState.errors} />

			{showDraftModal && (
				<DraftModal
					initialData={initialData}
					setIsFromDraft={setIsFromDraft}
					LOCAL_STORAGE_KEY={LOCAL_STORAGE_KEY}
					setShowDraftModal={setShowDraftModal}
					form={form}
					setInitialData={setInitialData}
					isEditMode={isEditMode}
					draftData={draftData}
				/>
			)}
		</div>
	);
};

export default Page;
