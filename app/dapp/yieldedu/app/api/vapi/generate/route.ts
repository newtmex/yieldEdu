import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { supabase } from "@/utils/supabase/server";

export const GET = async (request: Request) => {
	const url = new URL(request.url);
	const lessonId = url.searchParams.get("lesson_id");
	const userWallet = url.searchParams.get("user_wallet");

	if (!lessonId) {
		return Response.json(
			{
				error: "Lesson ID is required",
				success: false,
			},
			{ status: 400 }
		);
	}
	try {
		// Query the database for the lesson

		const { data: lesson, error } = await supabase
			.from("user_lessons")
			.select("*")
			.eq("lesson_id", lessonId)
			.eq("user_wallet", userWallet)
			.single();

		if (error) {
			return Response.json(
				{
					error: error.message || "Lesson not found",
					success: false,
				},
				{ status: 404 }
			);
		}

		return Response.json(
			{
				lesson,
				success: true,
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

export const POST = async (request: Request) => {
	try {
		const body = await request.json();
		const { lessonCount, topic, address, email, name } = body;

		if (!topic || !lessonCount || !address || !email || !name) {
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
			address,
			lesson,
			lesson_count: lessonCount,
			topic,
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
					address,
					email,
					name,
				},
			]);

			if (userError) {
				if (userError.code === "23505") {
					return Response.json(
						{
							error: "Email already exists",
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
