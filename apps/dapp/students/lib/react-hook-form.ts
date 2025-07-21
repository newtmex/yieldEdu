import { z } from "zod";

export const lessonSchema = z.object({
	title: z.string().min(1, "Lesson title is required"),
	content: z.any().nullable(),
	isPreview: z.boolean().default(false),
});

export const quizQuestionSchema = z.object({
	question: z.string().min(1, "Question is required"),
	options: z.array(z.string().min(1, "Option cannot be empty")).length(4),
	correctAnswer: z.number().min(0).max(3),
});

export const sectionSchema = z.object({
	title: z.string().min(1, "Section title is required"),
	chapters: z.number().min(1).default(1),
	lessons: z
		.array(lessonSchema)
		.min(5, "Each section must have at least 5 lessons"),
	quiz: z
		.array(quizQuestionSchema)
		.min(3, "Each section must have at least 3 quiz questions"),
});

export const courseSchema = z.object({
	title: z.string().min(1, "Course title is required"),
	description: z.string().min(10, "Description must be at least 10 characters"),
	longDescription: z.string().optional(),
	category: z.string().min(1, "Category is required"),
	difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
	whatYouWillLearn: z
		.array(z.string())
		.min(1, "At least one learning outcome is required"),
	sections: z
		.array(sectionSchema)
		.min(2, "Course must have at least 2 sections"),
});
