import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { useSession } from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ParamValue } from "next/dist/server/request/params";
import { ClassValue } from "clsx";
import { cn } from "@/lib/utils";

const CourseRating = ({
	courseId,
	className,
}: {
	courseId: string | ParamValue;
	className?: ClassValue;
}) => {
	const [rating, setRating] = useState(0);
	const [hoveredRating, setHoveredRating] = useState(0);
	const { data: session } = useSession();
	const userId = session?.user.id;
	const queryClient = useQueryClient();

	// Fetch course ratings
	const { data: courseData } = useQuery({
		queryKey: ["ratings", courseId],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("courses")
				.select("rating, title")
				.eq("id", courseId)
				.single();

			if (error) throw new Error(error.message);
			return data;
		},
		enabled: !!courseId,
	});

	// Mutation to update rating
	const rateMutation = useMutation({
		mutationFn: async (newRatings: { userId: string; rating: number }[]) => {
			const { error } = await supabase
				.from("courses")
				.update({ rating: newRatings })
				.eq("id", courseId);

			if (error) throw error;
		},
		onMutate: async (newRatings) => {
			await queryClient.cancelQueries({ queryKey: ["ratings", courseId] });
			const previousData = queryClient.getQueryData(["ratings", courseId]);
			queryClient.setQueryData(["ratings", courseId], (old: any) => ({
				...old,
				rating: newRatings,
			}));

			return { previousData };
		},
		onError: (_err, _vars, ctx) => {
			console.log(_err);
			queryClient.setQueryData(["ratings", courseId], ctx?.previousData);
			toast.error("Failed to rate course.");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["ratings", courseId] });
		},
	});

	useEffect(() => {
		if (courseData?.rating && userId) {
			const ratingsArray = Array.isArray(courseData.rating)
				? courseData.rating
				: JSON.parse(courseData.rating);
			const userRating = ratingsArray.find(
				(r: { userId: string }) => r.userId === userId
			);
			if (userRating) {
				setRating(userRating.rating);
			}
		}
	}, [courseData, userId]);

	const handleRating = (value: number) => {
		if (!userId || !courseData) return;

		const currentRatings = courseData.rating || [];
		const ratingsArray = Array.isArray(currentRatings)
			? currentRatings
			: JSON.parse(currentRatings);

		const existingIndex = ratingsArray.findIndex(
			(r: { userId: string }) => r.userId === userId
		);

		const updatedRatings =
			existingIndex >= 0
				? ratingsArray.map((r: { userId: string }, idx: number) =>
						idx === existingIndex ? { ...r, rating: value } : r
					)
				: [...ratingsArray, { userId, rating: value }];

		setRating(value);
		rateMutation.mutate(updatedRatings);

		toast.success("Course rated", {
			description: `You rated this course ${value} star${value !== 1 ? "s" : ""}!`,
		});

		confetti({
			particleCount: 100,
			spread: 70,
			origin: { x: 0.9, y: 1.1 },
		});
	};

	// Calculate average rating
	const averageRating = courseData?.rating?.length
		? (
				courseData.rating.reduce(
					(sum: number, r: { rating: string }) => sum + r.rating,
					0
				) / courseData.rating.length
			).toFixed(1)
		: "0";

	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center w-full gap-4",
				className
			)}
		>
			<div className="flex items-center justify-center">
				{[1, 2, 3, 4, 5].map((star) => (
					<Button
						key={star}
						variant="ghost"
						size="sm"
						className="p-1 h-auto"
						onMouseEnter={() => setHoveredRating(star)}
						onMouseLeave={() => setHoveredRating(0)}
						onClick={() => handleRating(star)}
					>
						<Star
							className={`size-4 ${
								star <= (hoveredRating || rating)
									? "fill-yellow-400 text-yellow-400"
									: "text-gray-300"
							}`}
						/>
					</Button>
				))}
			</div>
			<span className="text-xs text-muted-foreground italic">
				Average: {averageRating} / 5
			</span>
		</div>
	);
};

export default CourseRating;
