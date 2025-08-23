import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, BookOpen, Clock } from "lucide-react";

interface courseContentProps {
	courseContent?: {
		title: string;
		chapters: number;
		lessons: (
			| {
					title: string;
					isPreview: boolean;
			  }
			| {
					title: string;
					isPreview?: undefined;
			  }
		)[];
	}[];
}

const CourseContent = ({ courseContent = [] }: courseContentProps) => {
	const [expandedSections, setExpandedSections] = useState<number[]>([]);
	const [isAllExpanded, setIsAllExpanded] = useState(false);

	const toggleSection = (index: number) => {
		setExpandedSections((prev) =>
			prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
		);
	};

	const toggleExpandAll = () => {
		if (isAllExpanded) {
			setExpandedSections([]);
		} else {
			setExpandedSections(courseContent.map((_, index) => index));
		}
		setIsAllExpanded((prev) => !prev);
	};

	const totalchapters = courseContent.reduce(
		(sum, section) =>
			sum + section.lessons.filter((lesson) => lesson?.title?.trim()).length,
		0
	);

	return (
		<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
			<Card className="relative">
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="text-xl">Course content</CardTitle>
						<Button variant="outline" size="sm" onClick={toggleExpandAll}>
							{isAllExpanded ? "Collapse all" : "Expand all"}
						</Button>
					</div>
					<p className="text-sm text-muted-foreground">
						{courseContent.length} sections • {totalchapters}{" "}
						{totalchapters > 1 ? "chapters" : "chapter"}{" "}
					</p>
				</CardHeader>
				<CardContent className="space-y-2">
					{courseContent.map((section, sectionIndex) => (
						<div key={sectionIndex} className="border rounded-lg">
							<Button
								variant="ghost"
								className="w-full justify-between p-4 h-auto"
								onClick={() => toggleSection(sectionIndex)}
							>
								<div className="flex items-center gap-2">
									{expandedSections.includes(sectionIndex) ? (
										<ChevronDown className="w-4 h-4" />
									) : (
										<ChevronRight className="w-4 h-4" />
									)}
									<span className="font-medium text-left text-wrap">
										{section.title}
									</span>
								</div>
								<div className="flex items-center gap-4 text-xs">
									{section.lessons.filter((lesson) => lesson?.title?.trim())
										.length > 0 ? (
										<span>
											{section.lessons.length}{" "}
											{section.lessons.filter((lesson) => lesson?.title?.trim())
												.length > 1
												? "chapters"
												: "chapter"}
										</span>
									) : (
										<div className="text-muted-foreground text-xs italic">
											no chapters added
										</div>
									)}
								</div>
							</Button>

							{expandedSections.includes(sectionIndex) && (
								<div className="border-t bg-secondary">
									{section.lessons.filter((lesson) => lesson?.title?.trim())
										.length > 0 ? (
										section.lessons
											.filter((lesson) => lesson?.title?.trim())
											.map((lesson, lessonIndex) => (
												<div
													key={lessonIndex}
													className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-primary/20 transition-colors"
												>
													<div className="flex items-center gap-3">
														<BookOpen className="w-4 h-4" />
														<span className="text-sm">{lesson.title}</span>
													</div>
												</div>
											))
									) : (
										<div className="p-4 text-muted-foreground text-sm italic">
											No valid lessons added yet.
										</div>
									)}
								</div>
							)}
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
};

export default CourseContent;
