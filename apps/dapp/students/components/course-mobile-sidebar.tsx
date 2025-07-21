"use client";
"use client";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import CourseSidebar from "./course-sidebar";
import { useCourseSidebar } from "@/hooks/use-course-sidebar";

const courseData = {
	title: "Introduction to Web Development",
	sections: [
		{
			title: "Module 1: HTML Basics",
			lessons: [
				{ id: "1", title: "Introduction to HTML", type: "video" },
				{ id: "2", title: "HTML Tags and Elements", type: "article" },
				{ id: "3", title: "Quiz: HTML Basics", type: "quiz" },
			],
		},
		{
			title: "Module 2: CSS Fundamentals",
			lessons: [
				{ id: "4", title: "Introduction to CSS", type: "video" },
				{ id: "5", title: "CSS Selectors and Properties", type: "article" },
				{ id: "6", title: "Quiz: CSS Fundamentals", type: "quiz" },
			],
		},
	],
};

interface CourseMobileSidebarProps {
	currentSection: number;
	currentLesson: number;
	completedLessons: Set<string>;
	onNavigate: (sectionIndex: number, lessonIndex: number) => void;
}

const CourseMobileSidebar = ({
	currentSection,
	currentLesson,
	completedLessons,
	onNavigate,
}: CourseMobileSidebarProps) => {
	const { isCourseSidebarOpen, toggleCourseSidebar } = useCourseSidebar();

	return (
		<Sheet open={isCourseSidebarOpen} onOpenChange={toggleCourseSidebar}>
			<SheetContent side="left" className="p-0 w-72">
				<CourseSidebar
					course={courseData}
					currentSection={currentSection}
					currentLesson={currentLesson}
					onNavigate={onNavigate}
					completedLessons={completedLessons}
					className="w-full h-full border-r-0"
				/>
			</SheetContent>
		</Sheet>
	);
};

export default CourseMobileSidebar;
