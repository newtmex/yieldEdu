"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Edit, Trash2, Plus, BookOpen, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";

type DraftCourse = {
	id: string;
	title: string;
	description: string;
	updatedAt: string;
	status: "draft";
	chapters: number;
	lessons: number;
};

export default function ManageCourses() {
	const { data: session } = useSession();
	const [isDeleting, setIsDeleting] = useState(false);
	const [drafts, setDrafts] = useState<DraftCourse[]>([]);

	useEffect(() => {
		const draftCourses: DraftCourse[] = [];

		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key?.startsWith("course_draft")) {
				const raw = localStorage.getItem(key);
				if (!raw) continue;

				try {
					const parsed = JSON.parse(raw);
					if (!parsed?.title) continue;

					const id = key.split("course_draft_")[1] || "unsaved";

					// Count chapters and lessons
					const sections = parsed.sections || [];
					const chapters = sections.length;
					const lessons = sections.reduce((total: number, section: any) => {
						return total + (section?.lessons?.length || 0);
					}, 0);

					draftCourses.push({
						id,
						title: parsed.title || "(Untitled)",
						description: parsed.description || "No description",
						updatedAt: new Date().toISOString(),
						status: "draft",
						chapters,
						lessons,
					});
				} catch (e) {
					console.error("Invalid draft format", e);
				}
			}
		}

		setDrafts(draftCourses);
	}, []);

	const queryClient = useQueryClient();

	const {
		data: courses,
		error,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["manage-courses"],
		enabled: !!session?.user.name,
		queryFn: async () => {
			const { data, error } = await supabase
				.from("courses")
				.select(
					`
				id,
				title,
				description,
				updated_at,
				sections (
					id,
					lessons ( id )
				)
			`
				)
				.eq("instructor_name", session?.user.name);

			if (error) throw new Error(error.message);

			return data.map((course) => {
				const chapters = course.sections?.length || 0;
				const lessons = course.sections?.reduce(
					(total, section) => total + (section.lessons?.length || 0),
					0
				);

				return {
					id: course.id,
					title: course.title,
					description: course.description,
					status: "published",
					chapters,
					lessons,
					updatedAt: course.updated_at,
				};
			});
		},
	});

	if (isError) {
		toast.error("Failed to fetch courses", {
			description: error.message || "Something went wrong.",
		});
	}

	const handleDeleteCourse = async (courseId: string) => {
		setIsDeleting(true);

		try {
			const { error } = await supabase
				.from("courses")
				.delete()
				.eq("id", courseId);

			if (error) {
				toast.error("Failed to delete course", {
					description: error.message,
				});
				setIsDeleting(false); // Re-enable on error
				return;
			}

			toast.success("Course deleted", {
				description: "The course and all its content were removed.",
			});

			queryClient.invalidateQueries({ queryKey: ["manage-courses"] });
		} catch (err: any) {
			toast.error("Unexpected error", {
				description: err.message || "Something went wrong.",
			});
			setIsDeleting(false); // Re-enable on error
		}
	};

	const handleDeleteDraft = (id: string) => {
		const key = id === "unsaved" ? "course_draft" : `course_draft_${id}`;
		localStorage.removeItem(key);
		setDrafts((prev) => prev.filter((draft) => draft.id !== id));
		toast.success("Draft deleted");
	};

	const getStatusBadge = (status: string) => {
		return (
			<Badge variant={status === "published" ? "default" : "secondary"}>
				{status === "published" ? status : "draft"}
			</Badge>
		);
	};

	const allCourses = [...(courses || []), ...drafts];

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center flex-wrap gap-4 justify-between mb-8">
					<div>
						<h1 className="text-2xl md:text-3xl font-bold text-foreground">
							Manage Courses
						</h1>
						<p className="text-sm text-muted-foreground mt-2">
							View, edit, and manage your course content
						</p>
					</div>
					<Link href="/courses/create-course">
						<Button>
							<Plus className="w-4 h-4 mr-2" />
							Create New Course
						</Button>
					</Link>
				</div>

				{isLoading ? (
					<p className="text-center text-muted-foreground">
						Loading courses...
					</p>
				) : isError ? (
					<p className="text-center text-destructive">
						Failed to load courses.
					</p>
				) : !courses ? (
					<div className="text-center py-12">
						<p className="text-muted-foreground">
							Unable to load courses. Check your internet connection.
						</p>
					</div>
				) : allCourses?.length === 0 ? (
					<Card>
						<CardContent className="text-center py-12">
							<BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
							<h3 className="text-xl font-semibold text-foreground mb-2">
								No courses yet
							</h3>
							<p className="text-muted-foreground mb-6">
								Start by creating your first course and sharing your knowledge
							</p>
							<Link href="/courses/create-course">
								<Button size="lg">
									<Plus className="w-4 h-4 mr-2" />
									Create Your First Course
								</Button>
							</Link>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-4 grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(400px,1fr))] *:data-[slot=card]:from-lime-400/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card  *:data-[slot=card]:bg-gradient-to-t">
						{allCourses?.map((course) => (
							<Card
								key={course.id}
								className="hover:shadow-lg transition-shadow"
							>
								<CardHeader className="pb-3">
									<div className="flex justify-between items-center gap-4">
										<CardTitle className="text-lg line-clamp-2 mb-2">
											{course.title}
										</CardTitle>
										{getStatusBadge(course?.status)}
									</div>
									<CardDescription className="block truncate line-clamp-2 min-h-[2.5rem]">
										{course.description}
									</CardDescription>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="grid grid-cols-2 gap-4 mb-4">
										<div className="text-center">
											<div className="text-2xl font-bold text-primary">
												{course?.chapters}
											</div>
											<div className="text-xs text-muted-foreground">
												Chapters
											</div>
										</div>
										<div className="text-center">
											<div className="text-2xl font-bold text-primary">
												{course?.lessons}
											</div>
											<div className="text-xs text-muted-foreground">
												Lessons
											</div>
										</div>
									</div>

									<div className="text-xs dark:text-lime-400 text-yellow-400 mb-4">
										Last updated:{" "}
										{new Date(course?.updatedAt).toLocaleDateString()}
									</div>

									<div className="flex gap-2">
										{course.id && course.status !== "published" ? (
											<Link
												className="flex-1"
												href={
													course.id === "unsaved"
														? "/courses/create-course"
														: `/courses/create-course?id=${course.id}`
												}
											>
												<Button variant="outline" className="w-full">
													<Edit className="w-4 h-4 mr-2" />
													Resume draft
												</Button>
											</Link>
										) : (
											<Link
												href={`/courses/create-course?id=${course.id}`}
												className="flex-1"
											>
												<Button variant="outline" className="w-full">
													<Edit className="w-4 h-4 mr-2" />
													Edit
												</Button>
											</Link>
										)}

										<Dialog>
											<DialogTrigger asChild>
												<Button variant="outline" size="default">
													<Trash2 className="w-4 h-4" />
												</Button>
											</DialogTrigger>
											<DialogContent>
												<DialogHeader>
													<DialogTitle>Delete Course</DialogTitle>
													<DialogDescription>
														Are you sure you want to delete "{course.title}"?
														This action cannot be undone.
													</DialogDescription>
												</DialogHeader>
												<DialogFooter>
													<DialogClose asChild>
														<Button variant="outline">Cancel</Button>
													</DialogClose>
													<Button
														disabled={isDeleting}
														onClick={() =>
															course.status === "draft"
																? handleDeleteDraft(course.id)
																: handleDeleteCourse(course.id)
														}
														className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
													>
														{isDeleting ? (
															<>
																<LoaderCircle className="w-4 h-4 animate-spin" />{" "}
																Deleting...
															</>
														) : (
															"Delete Course"
														)}
													</Button>
												</DialogFooter>
											</DialogContent>
										</Dialog>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
