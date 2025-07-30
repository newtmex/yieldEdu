import { z } from "zod";

export const quizQuestionSchema = z
	.object({
		question: z
			.string()
			.min(1, "Question is required")
			.max(250, "Question too long"),

		options: z
			.array(
				z
					.string()
					.nonempty("Option cannot be empty")
					.max(200, "Option too long")
			)
			.length(4, "Exactly 4 options required"),

		correctAnswer: z.number().min(0).max(3),
	})
	.refine(
		(data) => {
			const trimmedOptions = data.options.map((opt) => opt.trim());
			const uniqueOptions = new Set(trimmedOptions);
			return uniqueOptions.size === data.options.length;
		},
		{
			message: "All options must be unique and non-empty",
			path: ["options"],
		}
	);

export const lessonSchema = z.object({
	title: z
		.string()
		.min(1, "Lesson title is required")
		.max(100, "Title too long"),
	content: z.any().nullable(),
	isPreview: z.boolean().default(false),
});

export const sectionSchema = z.object({
	title: z
		.string()
		.min(1, "Section title is required")
		.max(100, "Title too long"),
	chapters: z.number().min(1).default(1),
	lessons: z
		.array(lessonSchema)
		.min(1, "Each section must have at least 1 lessons")
		.max(15, "Maximum 15 lessons per section"),
	quizzes: z
		.array(quizQuestionSchema)
		.min(1, "Each section must have at least 1 quiz question")
		.max(15, "Maximum 15 quiz questions per section"),
});

export const courseSchema = z.object({
	title: z
		.string()
		.min(1, "Course title is required")
		.max(150, "Title too long"),
	description: z
		.string()
		.min(10, "Description must be at least 10 characters")
		.max(250, "Description too long"),
	longDescription: z
		.string()
		.min(50, "Long description must be at least 50 characters")
		.max(2000, "Long description too long"),
	category: z
		.string()
		.min(1, "Category is required")
		.max(50, "Category too long"),
	difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
	whatYouWillLearn: z
		.array(
			z
				.string()
				.min(1, "Learning outcome cannot be empty")
				.max(200, "Learning outcome too long")
		)
		.min(3, "At least 3 learning outcomes required")
		.max(100, "Maximum 10 learning outcomes"),
	sections: z
		.array(sectionSchema)
		.min(1, "Course must have at least 1 sections")
		.max(10, "Maximum 10 sections per course"),
});
