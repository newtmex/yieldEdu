"use client";

import { useSession } from "@/lib/auth-client";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

const useCourseInfo = (id: string) => {
	const { data: session } = useSession();

	const {
		data: courseStatus,
		isPending,
		error,
	} = useQuery({
		queryKey: ["enrollment", session?.user.id, id],
		enabled: !!session?.user.id && !!id,
		refetchInterval: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		gcTime: 0,
		refetchOnMount: false,
		queryFn: async () => {
			const { data, error } = await supabase
				.from("enrollments")
				.select("completed")
				.eq("course_id", id)
				.eq("user_id", session?.user.id)
				.maybeSingle();
			if (error) throw new Error(error.message);
			return data;
		},
	});
	return { course_completed: courseStatus?.completed, isPending, error };
};

export default useCourseInfo;
