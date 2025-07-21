import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";

function useIsTouchDevice() {
	const [isTouch, setIsTouch] = useState(false);
	useEffect(() => {
		setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
	}, []);
	return isTouch;
}

export function TooltipInfo({
	content,
	className,
	disabled,
}: {
	content: string;
	className?: ClassValue;
	disabled?: boolean;
}) {
	const isTouch = useIsTouchDevice();

	if (disabled)
		return (
			<span className={cn("cursor-help text-muted-foreground", className)}>
				<HelpCircle className="size-3 text-inherit" />
			</span>
		);

	if (isTouch) {
		return (
			<Popover>
				<PopoverTrigger asChild>
					<span className={cn("cursor-help text-muted-foreground", className)}>
						<HelpCircle className="size-3 text-inherit" />
					</span>
				</PopoverTrigger>
				<PopoverContent className="max-w-xs text-sm">{content}</PopoverContent>
			</Popover>
		);
	}

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<span className={cn("cursor-help text-muted-foreground", className)}>
						<HelpCircle className="size-3 text-inherit" />
					</span>
				</TooltipTrigger>
				<TooltipContent className="max-w-xs text-sm">{content}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
