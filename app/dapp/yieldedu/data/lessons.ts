import { supabase } from "@/utils/supabase/server";

export interface lessonsInterface {
	id: string;
	title: string;
	description: string;
	reward?: string | null;
	duration: string;
	completed?: boolean;
	isLocked?: boolean;
}

export const getAllLessons = async (): Promise<{
	success: boolean;
	data?: lessonsInterface[];
	error?: string;
}> => {
	try {
		const { data: lessons, error } = await supabase.from("lessons").select("*");

		if (error) return { success: false, error: error.message };

		if (lessons) return { success: true, data: lessons };

		return { success: false, error: "No lessons found" };
	} catch (error) {
		console.log(error);
		return { success: false, error: "Something went wrong" };
	}
};

export const getLesson = async (
	lessonId: string
): Promise<{
	success: boolean;
	data?: lessonsInterface[];
	error?: string;
}> => {
	try {
		const { data: lesson, error } = await supabase
			.from("lessons")
			.select("*")
			.eq("id", lessonId);

		if (error) return { success: false, error: error.message };
		if (lesson) return { success: true, data: lesson };
		return { success: false, error: "Lesson not found" };
	} catch (error) {
		console.log(error);
		if (error) return { success: false, error: "something went wrong" };
		return { success: false, error: "Unknown error occurred" };
	}
};
