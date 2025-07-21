import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
	BookOpen,
	CheckCircle,
	Circle,
	HelpCircle,
	Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseSidebarProps {
	course: {
		title: string;
		sections: Array<{
			title: string;
			lessons: Array<{
				id: string;
				title: string;
				type: string;
			}>;
		}>;
	};
	currentSection: number;
	currentLesson: number;
	onNavigate: (sectionIndex: number, lessonIndex: number) => void;
	completedLessons: Set<string>;
	className?: string;
}

const CourseSidebar = ({
	course,
	currentSection,
	currentLesson,
	onNavigate,
	completedLessons,
	className,
}: CourseSidebarProps) => {
	const totalLessons = course.sections.reduce(
		(sum, section) => sum + section.lessons.length,
		0
	);
	const completedCount = completedLessons.size;
	const progressPercentage = (completedCount / totalLessons) * 100;

	return (
		<div className={cn("w-80 border-r h-full overflow-y-auto", className)}>
			<div className="p-4 border-b">
				<h2 className="font-semibold text-lg mb-2">
					{course.sections[currentSection].title}
				</h2>
				<div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
					<span>
						{completedCount}/{totalLessons}
					</span>
					<Progress value={progressPercentage} className="flex-1" />
				</div>
			</div>

			<div className="p-4 space-y-4">
				{course.sections.map((section, sectionIndex) => (
					<div key={sectionIndex}>
						<div className="space-y-1">
							{section.lessons.map((lesson, lessonIndex) => {
								const isActive =
									sectionIndex === currentSection &&
									lessonIndex === currentLesson;
								const isCompleted = completedLessons.has(lesson.id);

								return (
									<Button
										key={lesson.id}
										variant="ghost"
										className={`w-full justify-start p-3 h-auto text-left ${
											isActive ? "bg-secondary border-l-2 border-lime-600" : ""
										}`}
										onClick={() => onNavigate(sectionIndex, lessonIndex)}
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
														{sectionIndex + 1}.{lessonIndex + 1}
													</span>
													{lesson.type === "quiz" && (
														<Badge
															variant="secondary"
															className="text-xs bg-lime-100 text-lime-700"
														>
															Quiz
														</Badge>
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
							})}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default CourseSidebar;
