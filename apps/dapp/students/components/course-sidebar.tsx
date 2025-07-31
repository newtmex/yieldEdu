import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle, Circle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
interface CourseSidebarProps {
	course: {
		id: any;
		title: any;
		description: any;
		sections: any;
	} | null;
	currentSection: number;
	currentLesson: number;
	onNavigate: (sectionIndex: number, lessonIndex: number) => void;
	completedLessons: Set<string>;
	className?: string;
	lastUnlockedLesson: number;
}

const CourseSidebar = ({
	course,
	currentSection,
	currentLesson,
	onNavigate,
	completedLessons,
	className,
	lastUnlockedLesson,
}: CourseSidebarProps) => {
	const totalLessons = course?.sections.reduce(
		(sum: number, section: (typeof course)["sections"]) =>
			sum + section.lessons.length,
		0
	);
	const completedCount = completedLessons.size;
	const progressPercentage = (completedCount / totalLessons) * 100;
	let lessonCounter = 0;
	return (
		<div
			className={cn(
				"w-80 border-r h-[calc(100vh-50px)] flex-col  lg:sticky lg:top-12",
				className
			)}
		>
			<div className="p-4 border-b ">
				<h2 className="font-semibold text-lg mb-2">
					{course?.sections[currentSection].title}
				</h2>
				<div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
					<span>
						{completedCount}/{totalLessons}
					</span>
					<Progress value={progressPercentage} className="flex-1" />
				</div>
			</div>
			<div className="h-[calc(100vh-100px)] overflow-y-auto">
				<div className="overflow-y-auto  overscroll-none">
					<div className="p-2 flex flex-col space-y-2">
						{course?.sections.map(
							(section: (typeof course)["sections"], sectionIndex: number) => {
								let quizIndex = 0;
								return (
									<div key={sectionIndex}>
										{section.lessons.map(
											(
												lesson: (typeof course)["sections"],
												lessonIndex: number
											) => {
												if (lesson.type === "quiz") {
													quizIndex++;
												}
												const isUnlocked = lessonCounter <= lastUnlockedLesson;
												lessonCounter++;

												const isActive =
													sectionIndex === currentSection &&
													lessonIndex === currentLesson;
												const isCompleted = completedLessons.has(lesson.id);

												return (
													<Button
														key={lesson.id}
														variant="ghost"
														className={`w-full justify-start p-3 h-auto text-left ${
															isActive
																? "bg-secondary border-l-2 border-lime-600"
																: ""
														}`}
														onClick={() =>
															onNavigate(sectionIndex, lessonIndex)
														}
														disabled={!isUnlocked}
													>
														<div className="flex items-center gap-3 w-full">
															<div className="flex-shrink-0">
																{isCompleted ? (
																	<CheckCircle className="size-4 text-green-500" />
																) : lesson.type === "quiz" ? (
																	<HelpCircle className="size-4 text-lime-500" />
																) : (
																	<BookOpen className="size-4" />
																)}
															</div>
															<div className="flex-1 min-w-0">
																<div className="flex items-center gap-2">
																	<span className="text-sm font-medium">
																		{lesson.type === "quiz"
																			? `Quiz ${sectionIndex + 1}.${quizIndex}`
																			: `Lesson ${sectionIndex + 1}.${
																					lessonIndex + 1
																				}`}
																	</span>
																	{lesson.type === "quiz" && (
																		<Badge variant="secondary">Quiz</Badge>
																	)}
																</div>

																<p className="text-sm text-muted-foreground truncate">
																	{lesson.title}
																</p>
															</div>
															{isActive && (
																<Circle className="size-2 fill-lime-600 text-lime-600 flex-shrink-0" />
															)}
														</div>
													</Button>
												);
											}
										)}
									</div>
								);
							}
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default CourseSidebar;
