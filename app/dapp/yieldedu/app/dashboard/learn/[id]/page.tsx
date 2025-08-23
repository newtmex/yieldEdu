import { Card } from "@/components/ui/card";
import { getLesson } from "@/data/lessons";
import { ArrowLeft, Brain, BarChart3 } from "lucide-react";
import Link from "next/link";
import StartLessonButton from "@/components/StartLessonButton";
import { Metadata } from "next";
import { yieldEduMetadata } from "@/utils/metadata";
interface CoursePageProps {
	params: Promise<{
		id: string;
	}>;
}

export async function generateMetadata({
	params,
}: CoursePageProps): Promise<Metadata> {
	const { id } = await params;
	const course = await getLesson(id);
	const courseData = course.data?.[0];

	return {
		...yieldEduMetadata,
		title: `YieldEdu - Learn ${courseData?.title}`,
		description: courseData?.description,
	};
}
export default async function CoursePage({ params }: CoursePageProps) {
	// This would normally come from a database or API
	const { id } = await params;
	const course = await getLesson(id);
	const courseData = course.data?.[0];

	return (
		<div className="min-h-screen text-foreground overflow-hidden relative">
			<main className="container mx-auto px-4 relative z-10">
				<div className="mb-8">
					<Link
						href="/dashboard/learn"
						className="inline-flex items-center text-primary hover:text-primary/80 transition-colors mb-6"
					>
						<ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
					</Link>

					<Card className="relative overflow-hidden dark:bg-gradient-to-r from-slate-800/50 to-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm p-8  border-border/20 mb-8">
						<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
							<div>
								<h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
									{courseData?.title}
								</h1>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							<div>
								<h2 className="text-xl font-bold mb-4 text-primary flex items-center">
									<Brain className="h-5 w-5 mr-2" /> Course Overview
								</h2>

								<p className="text-gray-300 mb-6">{courseData?.description}</p>
							</div>

							<div>
								<h2 className="text-xl font-bold mb-4 text-secondary flex items-center">
									<BarChart3 className="h-5 w-5 mr-2" /> Course Details
								</h2>

								<div className="space-y-4 mb-6">
									<div className="bg-slate-100 dark:bg-slate-900/50  border-slate-200 dark:border-slate-700 rounded-lg p-4 border border-border/10">
										<div className="grid grid-cols-2 gap-4">
											<div>
												<p className="text-sm text-gray-400">Duration</p>
												<p
													className="font-medium"
													// style={{ color: courseData.color }}
												>
													{courseData?.duration}
												</p>
											</div>

											{courseData?.reward && (
												<div>
													<p className="text-sm text-gray-400">Reward</p>
													<p
														className="font-medium"
														// style={{ color: courseData.color }}
													>
														{courseData.reward || "0"}
													</p>
												</div>
											)}
										</div>
									</div>
								</div>

								<div className="bg-slate-100 dark:bg-slate-900/50  border-slate-200 dark:border-slate-700 rounded-lg p-4 border border-border/10">
									<h3 className="font-bold mb-3 text-primary">
										How This Course Works
									</h3>
									<p className="text-gray-300 mb-4">
										This course is delivered through interactive conversations
										with our specialized AI educator Harry. You&apos;ll engage
										in natural dialogue and receive real-time feedback upon
										completion.
									</p>

									<StartLessonButton title={courseData?.title} lessonId={id} />
								</div>
							</div>
						</div>
					</Card>
				</div>
			</main>
		</div>
	);
}
