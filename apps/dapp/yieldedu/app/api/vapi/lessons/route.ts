import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { supabase } from "@/utils/supabase/server";

export const GET = async () => {
	return Response.json(
		{
			data: "Thank you!",
			success: true,
		},
		{ status: 200 }
	);
};

export const POST = async (request: Request) => {
	try {
		const body = await request.json();
		const { lessonCount, topic, address, lessonId } = body;

		if (!topic || !lessonCount || !address || !lessonId) {
			return Response.json(
				{
					error: "Missing required fields",
					success: false,
				},
				{ status: 400 }
			);
		}

		const { text: lesson } = await generateText({
			model: google("gemini-2.0-flash-001"),
			prompt: `
		    Generate ${
					lessonCount || 5
				} lessons on "${topic}".Don't include "/" ,"*" or any other special characters in it. The texts are going to be read by a voice assistant, just provide the lesson information.
		    - It should be Easy to understand.
		    - This lesson is an information being given to a model to train people on.
		    - Users will ask the model questions on this information and I don't want the model not.
		`,
		});

		const newLessonToDb = {
			user_wallet: address,
			lesson,
			lesson_count: lessonCount,
			topic,
			lesson_id: lessonId,
		};

		// Check if user exists
		const { data: userExists } = await supabase
			.from("users")
			.select("address")
			.eq("address", address)
			.single();

		if (!userExists) {
			const { error: userError } = await supabase.from("users").insert([
				{
					user_wallet: address,
				},
			]);

			if (userError) {
				if (userError.code === "23505") {
					return Response.json(
						{
							error: "user address already exists",
							success: false,
						},
						{ status: 400 }
					);
				}
				throw userError;
			}
		}

		const { data, error: lessonError } = await supabase
			.from("user_lessons")
			.insert([newLessonToDb])
			.select();

		if (lessonError) {
			throw lessonError;
		}

		return Response.json(
			{
				success: true,
				data,
			},
			{ status: 200 }
		);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error("Error:", error);
		return Response.json(
			{
				error: error.message || "Failed to process request",
				success: false,
			},
			{ status: 500 }
		);
	}
};
