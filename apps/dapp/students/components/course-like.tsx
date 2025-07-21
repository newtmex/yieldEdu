import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
// import { toast } from "sonner";

const CourseLike = () => {
	const [isLiked, setIsLiked] = useState(false);

	const handleLike = () => {
		setIsLiked(!isLiked);
		// toast(
		// 	isLiked ? "Course has been from favorites" : "Course added to favorites",
		// 	{
		// 		description: isLiked
		// 			? "You can find it in your course library"
		// 			: "You can find it in your favorites",
		// 	}
		// );
	};

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={handleLike}
			className="flex items-center gap-2"
		>
			<Heart
				className={`w-4 h-4 ${
					isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"
				}`}
			/>
			<span className="text-xs">{isLiked ? "Liked" : "Like"}</span>
		</Button>
	);
};

export default CourseLike;
