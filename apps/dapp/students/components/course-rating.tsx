import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { toast } from "sonner";

const CourseRating = () => {
	const [rating, setRating] = useState(0);
	const [hoveredRating, setHoveredRating] = useState(0);

	const handleRating = (value: number) => {
		setRating(value);
		toast("Course rated", {
			description: `You rated this course ${value} star${value !== 1 ? "s" : ""}!`,
		});
	};

	return (
		<div className="flex items-center gap-1">
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
			<span className="text-xs text-muted-foreground-600 ml-1">Rate</span>
		</div>
	);
};

export default CourseRating;
