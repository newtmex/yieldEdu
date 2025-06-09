import { supabase } from "@/utils/supabase/server";

export const GET = async (
	req: Request,
	{ params }: { params: Promise<{ lessonId: string }> }
) => {
	const { lessonId } = await params;

	if (!lessonId) {
		return Response.json(
			{
				error: "Missing required field lessonId",
				success: false,
			},
			{ status: 400 }
		);
	}

	const { data: user_lessons, error } = await supabase
		.from("user_lessons")
		.select("*")
		.eq("id", lessonId);

	if (error) {
		return Response.json(
			{
				error: error.message,
				success: false,
			},
			{ status: 400 }
		);
	}
	return Response.json(
		{
			data: user_lessons,
			success: true,
		},
		{ status: 200 }
	);
};
