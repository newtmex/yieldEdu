"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { ParamValue } from "next/dist/server/request/params";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const CourseLike = ({ courseId }: { courseId?: ParamValue }) => {
	const { data: session } = useSession();
	const userId = session?.user.id;
	const queryClient = useQueryClient();

	const { data: courseData } = useQuery({
		queryKey: ["likes", courseId],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("courses")
				.select("likes, title")
				.eq("id", courseId)
				.single();

			if (error) throw new Error(error.message);
			return data;
		},
		enabled: !!courseId,
	});

	// `useMemo` to calculate if user has liked
	const isLiked = useMemo(() => {
		if (!courseData?.likes || !userId) return false;
		return courseData.likes.includes(userId);
	}, [courseData, userId]);

	const likeMutation = useMutation({
		mutationFn: async (newLikes: string[]) => {
			const { error } = await supabase
				.from("courses")
				.update({ likes: newLikes })
				.eq("id", courseId);

			if (error) throw error;
		},
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: ["likes", courseId] });

			const previousData = queryClient.getQueryData(["likes", courseId]);

			queryClient.setQueryData(["likes", courseId], (old: any) => {
				const currentLikes = old?.likes || [];
				const alreadyLiked = currentLikes.includes(userId);
				const updatedLikes = alreadyLiked
					? currentLikes.filter((id: string) => id !== userId)
					: [...currentLikes, userId];

				return {
					...old,
					likes: updatedLikes,
				};
			});

			return { previousData };
		},
		onError: (_err, _vars, ctx) => {
			queryClient.setQueryData(["likes", courseId], ctx?.previousData);
			toast.error("Failed to update like.");
			console.log(_err);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["likes", courseId] });
		},
	});

	const handleLike = () => {
		if (!userId || !courseData) return;

		const currentLikes = courseData.likes || [];
		const updatedLikes = isLiked
			? currentLikes.filter((id: string) => id !== userId)
			: [...currentLikes, userId];

		likeMutation.mutate(updatedLikes);

		toast.success(
			isLiked
				? `You unliked ${courseData?.title}`
				: `You liked ${courseData?.title}`
		);
	};

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={handleLike}
			className="flex items-center gap-2"
		>
			<Heart
				className={`w-4 h-4 transition ${
					isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"
				}`}
			/>
			<span className="text-xs">{isLiked ? "Liked" : "Like"}</span>
		</Button>
	);
};

export default CourseLike;
