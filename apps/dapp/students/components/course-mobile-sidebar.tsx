"use client";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import CourseSidebar from "./course-sidebar";
import { useCourseSidebar } from "@/hooks/use-course-sidebar";
import { ScrollArea } from "./ui/scroll-area";

interface CourseMobileSidebarProps {
	currentSection: number;
	currentLesson: number;
	completedLessons: Set<string>;
	onNavigate: (sectionIndex: number, lessonIndex: number) => void;
	course: {
		id: any;
		title: any;
		description: any;
		sections: any;
	} | null;
	lastUnlockedLesson: number;
}

const CourseMobileSidebar = ({
	currentSection,
	currentLesson,
	completedLessons,
	course,
	onNavigate,
	lastUnlockedLesson,
}: CourseMobileSidebarProps) => {
	const { isCourseSidebarOpen, toggleCourseSidebar } = useCourseSidebar();

	return (
		<Sheet open={isCourseSidebarOpen} onOpenChange={toggleCourseSidebar}>
			<SheetContent side="left" className="p-0 w-72">
				<CourseSidebar
					course={course}
					currentSection={currentSection}
					currentLesson={currentLesson}
					onNavigate={onNavigate}
					completedLessons={completedLessons}
					className="w-full h-full border-r-0"
					lastUnlockedLesson={lastUnlockedLesson}
				/>
			</SheetContent>
		</Sheet>
	);
};

export default CourseMobileSidebar;
