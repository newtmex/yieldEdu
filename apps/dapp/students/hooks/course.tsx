"use client";

import { useSession } from "@/lib/auth-client";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

const useCourseInfo = (id: string) => {
	const { data: session } = useSession();

	const { data: courseStatus, isPending } = useQuery({
		queryKey: ["completed_course", id],
		enabled: !!session?.user.id && !!id,
		refetchInterval: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: false,
		queryFn: async () => {
			const { data, error } = await supabase
				.from("enrollments")
				.select("completed")
				.eq("course_id", id)
				.eq("user_id", session?.user.id)
				.single();
			if (error) throw new Error(error.message);
			return data;
		},
	});
	return { course_completed: courseStatus?.completed, isPending };
};

export default useCourseInfo;
